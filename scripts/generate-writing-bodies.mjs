// 把 content/writing/*.md 的正文生成为 TS 模块（content/writing-bodies.ts），
// 让文章正文随 bundle 进入 Cloudflare Workers —— 运行时没有文件系统，禁止 readFileSync。
// 运行：pnpm gen:bodies（sync:writing 之后需要重新生成）。
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const indexSource = readFileSync(join(root, "content", "writing-posts.ts"), "utf8");

const entries = [...indexSource.matchAll(/"slug":\s*"([^"]+)"[\s\S]*?"bodyFile":\s*"([^"]+)"/g)];
if (entries.length === 0) {
  console.error("no posts found in content/writing-posts.ts");
  process.exit(1);
}

const lines = entries.map(([, slug, bodyFile]) => {
  const body = readFileSync(join(root, "content", "writing", bodyFile), "utf8");
  return `  ${JSON.stringify(slug)}: ${JSON.stringify(body)},`;
});

const banner = [
  "// 由 scripts/generate-writing-bodies.mjs 生成，不要手改。",
  "// 正文以模块形式打进 bundle：Cloudflare Workers 运行时没有文件系统。",
];

writeFileSync(
  join(root, "content", "writing-bodies.ts"),
  `${banner.join("\n")}\nexport const writingBodies: Record<string, string> = {\n${lines.join("\n")}\n};\n`,
);

console.log(`generated content/writing-bodies.ts with ${entries.length} bodies`);
