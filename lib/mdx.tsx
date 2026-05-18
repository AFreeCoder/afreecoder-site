import type { ReactNode } from "react";

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
      nodes.push(
        <code
          key={nodes.length}
          className="rounded border border-[var(--color-border)] bg-[var(--color-card)] px-1.5 py-0.5 font-mono text-[14px] text-[var(--color-accent)]"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      const link = /^\[([^\]]+)]\(([^)]+)\)$/.exec(token);
      if (link) {
        nodes.push(
          <a
            key={nodes.length}
            href={link[2]}
            className="text-[var(--color-accent)] underline-offset-4 hover:underline"
            target={link[2].startsWith("http") ? "_blank" : undefined}
            rel={link[2].startsWith("http") ? "noreferrer" : undefined}
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
  return (
    <>
      {parseBlocks(source).map((block, index) => {
        if (block.type === "heading") {
          const className =
            block.level === 1
              ? "mt-10 mb-4 text-[30px] font-bold tracking-[-0.5px] text-[var(--color-fg)]"
              : block.level === 2
                ? "mt-9 mb-3 text-[24px] font-semibold tracking-[-0.3px] text-[var(--color-fg)]"
                : block.level === 3
                  ? "mt-7 mb-2 text-[19px] font-semibold text-[var(--color-fg)]"
                  : "mt-6 mb-2 text-[17px] font-semibold text-[var(--color-fg)]";
          const children = renderInline(block.text);
          if (block.level === 1) return <h1 key={index} className={className}>{children}</h1>;
          if (block.level === 2) return <h2 key={index} className={className}>{children}</h2>;
          if (block.level === 3) return <h3 key={index} className={className}>{children}</h3>;
          return <h4 key={index} className={className}>{children}</h4>;
        }

        if (block.type === "paragraph") {
          return (
            <p
              key={index}
              className="my-4 text-[17px] leading-[1.85] text-[var(--color-fg)]"
            >
              {renderWithBreaks(block.text)}
            </p>
          );
        }

        if (block.type === "list") {
          const Tag = block.ordered ? "ol" : "ul";
          return (
            <Tag
              key={index}
              className={`my-4 space-y-1.5 pl-6 text-[17px] leading-[1.8] text-[var(--color-fg)] ${block.ordered ? "list-decimal" : "list-disc"}`}
            >
              {block.items.map((item) => (
                <li key={item}>{renderInline(item)}</li>
              ))}
            </Tag>
          );
        }

        if (block.type === "blockquote") {
          return (
            <blockquote
              key={index}
              className="my-5 border-l-2 border-[var(--color-accent)] pl-4 text-[16px] italic leading-[1.8] text-[var(--color-muted)]"
            >
              {renderWithBreaks(block.text)}
            </blockquote>
          );
        }

        if (block.type === "image") {
          return (
            // eslint-disable-next-line @next/next/no-img-element -- Historical Markdown images already use absolute OSS URLs with unknown intrinsic sizes.
            <img
              key={index}
              src={block.src}
              alt={block.alt}
              className="my-6 block h-auto max-w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)]"
            />
          );
        }

        if (block.type === "code") {
          return (
            <pre
              key={index}
              className="my-5 overflow-x-auto rounded-[8px] border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-[14px] leading-[1.7] text-[var(--color-fg)]"
            >
              <code>{block.code}</code>
            </pre>
          );
        }

        if (block.type === "table") {
          return (
            <div key={index} className="my-5 overflow-x-auto">
              <table className="w-full border-collapse text-[15px] leading-[1.6] text-[var(--color-fg)]">
                <thead>
                  <tr>
                    {block.headers.map((header) => (
                      <th
                        key={header}
                        className="border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-left font-semibold"
                      >
                        {renderInline(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={`${rowIndex}-${cellIndex}`}
                          className="border border-[var(--color-border)] px-3 py-2 align-top"
                        >
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

        return <hr key={index} className="my-8 border-t border-[var(--color-border)]" />;
      })}
    </>
  );
}
