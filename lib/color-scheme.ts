export type ColorScheme = "dark" | "light";

export const COLOR_SCHEMES: readonly ColorScheme[] = ["dark", "light"] as const;

export const DEFAULT_COLOR_SCHEME: ColorScheme = "dark";

export const COLOR_SCHEME_COOKIE = "color-scheme";

export function isColorScheme(value: unknown): value is ColorScheme {
  return typeof value === "string" && (COLOR_SCHEMES as readonly string[]).includes(value);
}
