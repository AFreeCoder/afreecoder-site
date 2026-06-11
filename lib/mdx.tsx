import type { ReactNode } from "react";
import { highlightCode } from "./highlight";

type Block =
  | { type: "heading"; level: 1 | 2 | 3 | 4; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "blockquote"; text: string }
  | { type: "image"; alt: string; src: string }
  | { type: "code"; language?: string; code: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "hr" };

function flushParagraph(lines: string[], blocks: Block[]) {
  if (lines.length === 0) return;
  blocks.push({ type: "paragraph", text: lines.join(" ") });
  lines.length = 0;
}

function isTableRow(line: string) {
  return line.startsWith("|") && line.endsWith("|") && line.includes("|", 1);
}

function isTableSeparator(line: string) {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line);
}

function parseTableRow(line: string) {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  const paragraph: string[] = [];
  const lines = source.replace(/\r\n/g, "\n").split("\n");

  for (let index = 0; index < lines.length; index++) {
    const raw = lines[index];
    const line = raw.trim();

    if (!line) {
      flushParagraph(paragraph, blocks);
      continue;
    }

    const fence = /^```([A-Za-z0-9_-]+)?\s*$/.exec(line);
    if (fence) {
      flushParagraph(paragraph, blocks);
      const code: string[] = [];
      while (index + 1 < lines.length && !lines[index + 1].trim().startsWith("```")) {
        index += 1;
        code.push(lines[index]);
      }
      if (index + 1 < lines.length) index += 1;
      blocks.push({ type: "code", language: fence[1], code: code.join("\n") });
      continue;
    }

    if (line === "---") {
      flushParagraph(paragraph, blocks);
      blocks.push({ type: "hr" });
      continue;
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph(paragraph, blocks);
      blocks.push({
        type: "heading",
        level: heading[1].length as 1 | 2 | 3 | 4,
        text: heading[2],
      });
      continue;
    }

    const image = /^!\[([^\]]*)]\(([^)]+)\)\s*$/.exec(line);
    if (image) {
      flushParagraph(paragraph, blocks);
      blocks.push({ type: "image", alt: image[1], src: image[2] });
      continue;
    }

    if (
      isTableRow(line) &&
      index + 1 < lines.length &&
      isTableSeparator(lines[index + 1].trim())
    ) {
      flushParagraph(paragraph, blocks);
      const headers = parseTableRow(line);
      index += 1;
      const rows: string[][] = [];
      while (index + 1 < lines.length && isTableRow(lines[index + 1].trim())) {
        index += 1;
        rows.push(parseTableRow(lines[index].trim()));
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    const unordered = /^-\s+(.+)$/.exec(line);
    const ordered = /^\d+\.\s+(.+)$/.exec(line);
    if (unordered || ordered) {
      flushParagraph(paragraph, blocks);
      const isOrdered = Boolean(ordered);
      const items = [(unordered ?? ordered)![1]];
      while (index + 1 < lines.length) {
        const next = lines[index + 1].trim();
        const nextMatch = isOrdered ? /^\d+\.\s+(.+)$/.exec(next) : /^-\s+(.+)$/.exec(next);
        if (!nextMatch) break;
        index += 1;
        items.push(nextMatch[1]);
      }
      blocks.push({ type: "list", ordered: isOrdered, items });
      continue;
    }

    if (line.startsWith(">")) {
      flushParagraph(paragraph, blocks);
      const quote = [line.replace(/^>\s?/, "")];
      while (index + 1 < lines.length && lines[index + 1].trim().startsWith(">")) {
        index += 1;
        quote.push(lines[index].trim().replace(/^>\s?/, ""));
      }
      blocks.push({ type: "blockquote", text: quote.join("\n") });
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph(paragraph, blocks);
  return blocks;
}

export type TocItem = { id: string; text: string; level: 2 | 3 };

/** 去掉行内 Markdown 标记，得到标题纯文本 */
function plainText(text: string): string {
  return text
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

/** 中文友好的 slug：保留 CJK/字母/数字，空白转连字符 */
function slugify(text: string): string {
  const base = plainText(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]+/gu, "")
    .trim()
    .replace(/\s+/g, "-");
  return base || "section";
}

/** 为 h2–h4 生成稳定且去重的 id（渲染与目录提取共用，保证锚点一致） */
function assignHeadingIds(
  blocks: Block[],
): Map<number, { id: string; text: string; level: number }> {
  const seen = new Map<string, number>();
  const ids = new Map<number, { id: string; text: string; level: number }>();
  blocks.forEach((block, index) => {
    if (block.type !== "heading" || block.level < 2) return;
    const base = slugify(block.text);
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    ids.set(index, {
      id: count > 1 ? `${base}-${count}` : base,
      text: plainText(block.text),
      level: block.level,
    });
  });
  return ids;
}

export function extractToc(source: string): TocItem[] {
  return [...assignHeadingIds(parseBlocks(source)).values()]
    .filter((h) => h.level === 2 || h.level === 3)
    .map((h) => ({ id: h.id, text: h.text, level: h.level as 2 | 3 }));
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+]\([^)]+\))/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    const token = match[0];

    if (token.startsWith("**")) {
      nodes.push(<strong key={nodes.length}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={nodes.length}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("`")) {
      nodes.push(<code key={nodes.length}>{token.slice(1, -1)}</code>);
    } else {
      const link = /^\[([^\]]+)]\(([^)]+)\)$/.exec(token);
      if (link) {
        const external = link[2].startsWith("http");
        nodes.push(
          <a
            key={nodes.length}
            href={link[2]}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
          >
            {link[1]}
          </a>,
        );
      }
    }

    cursor = match.index + token.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function renderWithBreaks(text: string): ReactNode[] {
  return text.split("\n").flatMap((line, index) => {
    const nodes = renderInline(line);
    return index === 0 ? nodes : [<br key={`br-${index}`} />, ...nodes];
  });
}

export function Mdx({ source }: { source: string }) {
  const blocks = parseBlocks(source);
  const headingIds = assignHeadingIds(blocks);
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const children = renderInline(block.text);
          const id = headingIds.get(index)?.id;
          if (block.level === 1) return <h1 key={index}>{children}</h1>;
          if (block.level === 2) return <h2 key={index} id={id}>{children}</h2>;
          if (block.level === 3) return <h3 key={index} id={id}>{children}</h3>;
          return <h4 key={index} id={id}>{children}</h4>;
        }

        if (block.type === "paragraph") {
          return <p key={index}>{renderWithBreaks(block.text)}</p>;
        }

        if (block.type === "list") {
          const Tag = block.ordered ? "ol" : "ul";
          return (
            <Tag key={index}>
              {block.items.map((item) => (
                <li key={item}>{renderInline(item)}</li>
              ))}
            </Tag>
          );
        }

        if (block.type === "blockquote") {
          return (
            <blockquote key={index}>{renderWithBreaks(block.text)}</blockquote>
          );
        }

        if (block.type === "image") {
          return (
            // eslint-disable-next-line @next/next/no-img-element -- Historical Markdown images already use absolute OSS URLs with unknown intrinsic sizes.
            <img key={index} src={block.src} alt={block.alt} />
          );
        }

        if (block.type === "code") {
          const highlighted = highlightCode(block.code, block.language);
          if (highlighted) {
            return (
              <div
                key={index}
                className="prose-code"
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            );
          }
          return (
            <pre key={index}>
              <code>{block.code}</code>
            </pre>
          );
        }

        if (block.type === "table") {
          return (
            <div key={index} className="prose-table-scroll">
              <table>
                <thead>
                  <tr>
                    {block.headers.map((header) => (
                      <th key={header}>{renderInline(header)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={`${rowIndex}-${cellIndex}`}>
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return <hr key={index} />;
      })}
    </>
  );
}
