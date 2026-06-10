import { createHighlighterCoreSync, type HighlighterCore } from "@shikijs/core";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";
import { highlightLangs, highlightThemes } from "./highlight-data";

/** 历史文章里的语言别名 → shiki 语言 id；未注册的语言由调用方回退纯文本。 */
const LANG_ALIASES: Record<string, string> = {
  golang: "go",
  shell: "bash",
  sh: "bash",
  zsh: "bash",
  pgsql: "sql",
  mysql: "sql",
  properties: "ini",
};

let highlighter: HighlighterCore | null = null;

function getHighlighter(): HighlighterCore {
  highlighter ??= createHighlighterCoreSync({
    themes: highlightThemes,
    langs: highlightLangs,
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

export function highlightCode(code: string, language?: string): string | null {
  if (!language) return null;
  const id = language.toLowerCase();
  const lang = LANG_ALIASES[id] ?? id;
  const hl = getHighlighter();
  if (!hl.getLoadedLanguages().includes(lang)) return null;
  return hl.codeToHtml(code, {
    lang,
    themes: { light: "vitesse-light", dark: "vitesse-dark" },
    defaultColor: false,
  });
}
