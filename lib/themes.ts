export const THEME_IDS = [
  "sand",
  "ink",
  "mist",
  "moss",
  "editorial",
  "terminal",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const THEMES: { id: ThemeId; label: string; swatch: string }[] = [
  { id: "sand",      label: "暖砂 Warm Sand",   swatch: "#c2410c" },
  { id: "ink",       label: "墨夜 Ink Night",   swatch: "#fb923c" },
  { id: "mist",      label: "冷雾 Cold Mist",   swatch: "#1e40af" },
  { id: "moss",      label: "苔石 Moss Stone",  swatch: "#d4a574" },
  { id: "editorial", label: "报刊 Editorial",   swatch: "#9b2c2c" },
  { id: "terminal",  label: "终端 Terminal",    swatch: "#7ee787" },
];

export const DEFAULT_THEME: ThemeId = "sand";
