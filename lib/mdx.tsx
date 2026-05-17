import { MDXRemote } from "next-mdx-remote/rsc";
import type { MDXComponents } from "mdx/types";
import rehypePrettyCode from "rehype-pretty-code";

const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1
      {...props}
      className="mt-10 mb-4 text-[30px] font-bold tracking-[-0.5px] text-[var(--color-fg)]"
    />
  ),
  h2: (props) => (
    <h2
      {...props}
      className="mt-9 mb-3 text-[22px] font-semibold tracking-[-0.3px] text-[var(--color-fg)]"
    />
  ),
  h3: (props) => (
    <h3
      {...props}
      className="mt-7 mb-2 text-[18px] font-semibold text-[var(--color-fg)]"
    />
  ),
  p: (props) => (
    <p {...props} className="my-4 text-[17px] leading-[1.85] text-[var(--color-fg)]" />
  ),
  a: (props) => (
    <a
      {...props}
      className="text-[var(--color-accent)] underline-offset-4 hover:underline"
    />
  ),
  ul: (props) => (
    <ul {...props} className="my-4 list-disc space-y-1.5 pl-6 text-[17px] leading-[1.8] text-[var(--color-fg)]" />
  ),
  ol: (props) => (
    <ol {...props} className="my-4 list-decimal space-y-1.5 pl-6 text-[17px] leading-[1.8] text-[var(--color-fg)]" />
  ),
  blockquote: (props) => (
    <blockquote
      {...props}
      className="my-5 border-l-2 border-[var(--color-accent)] pl-4 text-[16px] italic text-[var(--color-muted)]"
    />
  ),
  code: (props) => (
    <code
      {...props}
      className="rounded border border-[var(--color-border)] bg-[var(--color-card)] px-1.5 py-0.5 font-mono text-[14px] text-[var(--color-accent)]"
    />
  ),
  hr: (props) => (
    <hr {...props} className="my-8 border-t border-[var(--color-border)]" />
  ),
};

export function Mdx({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
        mdxOptions: {
          rehypePlugins: [
            [
              rehypePrettyCode,
              {
                theme: "github-light",
                keepBackground: true,
              },
            ],
          ],
        },
      }}
    />
  );
}
