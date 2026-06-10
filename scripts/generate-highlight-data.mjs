// 把 shiki 需要的语法与主题 JSON 内联成 TS 模块（lib/highlight-data.ts）。
// 动机：打包器会把 shiki 聚合包 externalize 成主入口（253 种语言全量打进
// worker，超过 Cloudflare 3MiB 限制）。数据内联后运行时只依赖 @shikijs/core。
// 运行：pnpm gen:highlight（调整语言/主题清单后需重新生成）。
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const LANGS = ["go", "bash", "json", "sql", "ini"];
const THEMES = ["vitesse-light", "vitesse-dark"];

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const langData = [];
for (const name of LANGS) {
  const mod = await import(`@shikijs/langs/${name}`);
  // 每个语言模块默认导出语法数组（可能含依赖语法，如 bash → shellscript）
  langData.push(...mod.default);
}

const themeData = [];
for (const name of THEMES) {
  const mod = await import(`@shikijs/themes/${name}`);
  themeData.push(mod.default);
}

const banner = [
  "// 由 scripts/generate-highlight-data.mjs 生成，不要手改。",
  `// 语言：${LANGS.join(", ")}；主题：${THEMES.join(", ")}`,
  "// 数据内联使 worker 不依赖 @shikijs/langs/@shikijs/themes（避免全量打包超限）。",
];

writeFileSync(
  join(root, "lib", "highlight-data.ts"),
  `${banner.join("\n")}
import type { LanguageRegistration, ThemeRegistrationRaw } from "@shikijs/core";

export const highlightLangs = ${JSON.stringify(langData)} as unknown as LanguageRegistration[];

export const highlightThemes = ${JSON.stringify(themeData)} as unknown as ThemeRegistrationRaw[];
`,
);

console.log(
  `generated lib/highlight-data.ts: ${langData.length} grammars, ${themeData.length} themes`,
);
