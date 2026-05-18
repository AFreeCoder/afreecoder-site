import type { ReactNode } from "react";

type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "blockquote"; text: string }
  | { type: "hr" };

function flushParagraph(lines: string[], blocks: Block[]) {
  if (lines.length === 0) return;
  blocks.push({ type: "paragraph", text: lines.join(" ") });
  lines.length = 0;
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

    if (line === "---") {
      flushParagraph(paragraph, blocks);
      blocks.push({ type: "hr" });
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph(paragraph, blocks);
      blocks.push({
        type: "heading",
        level: heading[1].length as 1 | 2 | 3,
        text: heading[2],
      });
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph(paragraph, blocks);
      const items = [line.slice(2)];
      while (index + 1 < lines.length && lines[index + 1].trim().startsWith("- ")) {
        index += 1;
        items.push(lines[index].trim().slice(2));
      }
      blocks.push({ type: "list", items });
      continue;
    }

    if (line.startsWith("> ")) {
      flushParagraph(paragraph, blocks);
      blocks.push({ type: "blockquote", text: line.slice(2) });
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph(paragraph, blocks);
  return blocks;
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    const token = match[0];

    if (token.startsWith("**")) {
      nodes.push(<strong key={nodes.length}>{token.slice(2, -2)}</strong>);
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
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
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

export function Mdx({ source }: { source: string }) {
  return (
    <>
      {parseBlocks(source).map((block, index) => {
        if (block.type === "heading") {
          const className =
            block.level === 1
              ? "mt-10 mb-4 text-[30px] font-bold tracking-[-0.5px] text-[var(--color-fg)]"
              : block.level === 2
                ? "mt-9 mb-3 text-[22px] font-semibold tracking-[-0.3px] text-[var(--color-fg)]"
                : "mt-7 mb-2 text-[18px] font-semibold text-[var(--color-fg)]";
          const children = renderInline(block.text);
          if (block.level === 1) return <h1 key={index} className={className}>{children}</h1>;
          if (block.level === 2) return <h2 key={index} className={className}>{children}</h2>;
          return <h3 key={index} className={className}>{children}</h3>;
        }

        if (block.type === "paragraph") {
          return (
            <p
              key={index}
              className="my-4 text-[17px] leading-[1.85] text-[var(--color-fg)]"
            >
              {renderInline(block.text)}
            </p>
          );
        }

        if (block.type === "list") {
          return (
            <ul
              key={index}
              className="my-4 list-disc space-y-1.5 pl-6 text-[17px] leading-[1.8] text-[var(--color-fg)]"
            >
              {block.items.map((item) => (
                <li key={item}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "blockquote") {
          return (
            <blockquote
              key={index}
              className="my-5 border-l-2 border-[var(--color-accent)] pl-4 text-[16px] italic text-[var(--color-muted)]"
            >
              {renderInline(block.text)}
            </blockquote>
          );
        }

        return <hr key={index} className="my-8 border-t border-[var(--color-border)]" />;
      })}
    </>
  );
}
