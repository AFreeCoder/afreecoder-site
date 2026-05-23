export const THEME_IDS = ["annual", "workshop", "nocturne", "telegraph"] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string"
    && (THEME_IDS as readonly string[]).includes(value);
}

export type ThemeMeta = {
  id: ThemeId;
  label: string;
  swatch: string;
  blurb: string;
  available: boolean;
};

export const THEMES: ThemeMeta[] = [
  { id: "annual",    label: "年鉴 Annual",    swatch: "#b53028", blurb: "宣纸米 · 朱砂印章 · 章节式",  available: true  },
  { id: "workshop",  label: "工坊 Workshop",  swatch: "#ff5b1f", blurb: "蓝图网格 · 工程文档式",       available: false },
  { id: "nocturne",  label: "夜灯 Nocturne",  swatch: "#f0a04b", blurb: "深炭 · 琥珀光 · 巨型衬线",    available: false },
  { id: "telegraph", label: "电报 Telegraph", swatch: "#7dff9a", blurb: "墨绿磷光 · ASCII · 终端式",   available: false },
];

export const DEFAULT_THEME: ThemeId = "annual";

/**
 * 临时保留：旧主题 ID 字符串数组。
 * 仅供尚未删除的旧组件 import，避免中间阶段编译失败。
 * Task 18（阶段一收尾）时连同旧组件一起删除。
 */
export const LEGACY_THEME_IDS = ["sand", "ink", "mist", "moss", "editorial", "terminal"] as const;
