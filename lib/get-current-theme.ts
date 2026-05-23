import { cookies } from "next/headers";
import { DEFAULT_THEME, isThemeId, THEME_COOKIE_NAME, type ThemeId } from "./themes";

export async function getCurrentTheme(): Promise<ThemeId> {
  const store = await cookies();
  const value = store.get(THEME_COOKIE_NAME)?.value;
  return isThemeId(value) ? value : DEFAULT_THEME;
}
