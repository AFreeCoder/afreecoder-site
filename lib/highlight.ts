import { createHighlighterCoreSync, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import go from "@shikijs/langs/go";
import bash from "@shikijs/langs/bash";
import json from "@shikijs/langs/json";
import sql from "@shikijs/langs/sql";
import ini from "@shikijs/langs/ini";
import vitesseLight from "@shikijs/themes/vitesse-light";
import vitesseDark from "@shikijs/themes/vitesse-dark";

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
    themes: [vitesseLight, vitesseDark],
    langs: [go, bash, json, sql, ini],
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
