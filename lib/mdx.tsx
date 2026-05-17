import { MDXRemote } from "next-mdx-remote/rsc";
import type { MDXComponents } from "mdx/types";
import rehypePrettyCode from "rehype-pretty-code";

const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1
      {...props}
      className="mt-10 mb-4 text-[28px] font-bold tracking-[-0.5px] text-white"
    />
  ),
  h2: (props) => (
    <h2
      {...props}
      className="mt-8 mb-3 text-[20px] font-semibold tracking-[-0.3px] text-white"
    />
  ),
  h3: (props) => (
    <h3
      {...props}
      className="mt-6 mb-2 text-[16px] font-semibold text-white"
    />
  ),
  p: (props) => (
    <p {...props} className="my-4 text-[15px] leading-[1.85] text-[#d4d4d4]" />
  ),
  a: (props) => (
    <a
      {...props}
      className="text-[var(--color-accent)] underline-offset-4 hover:underline"
    />
  ),
  ul: (props) => (
    <ul {...props} className="my-4 list-disc space-y-1 pl-6 text-[#d4d4d4]" />
  ),
  ol: (props) => (
    <ol {...props} className="my-4 list-decimal space-y-1 pl-6 text-[#d4d4d4]" />
  ),
  blockquote: (props) => (
    <blockquote
      {...props}
      className="my-4 border-l-2 border-[var(--color-accent)] pl-4 italic text-[var(--color-muted)]"
    />
  ),
  code: (props) => (
    <code
      {...props}
      className="rounded bg-[#1a1a1a] px-1.5 py-0.5 font-mono text-[13px] text-[var(--color-accent)]"
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
                theme: "github-dark-dimmed",
                keepBackground: true,
              },
            ],
          ],
        },
      }}
    />
  );
}
