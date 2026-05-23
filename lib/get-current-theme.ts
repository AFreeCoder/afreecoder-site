import { cookies } from "next/headers";
import { DEFAULT_THEME, isThemeId, type ThemeId } from "./themes";

const COOKIE_NAME = "theme";

export async function getCurrentTheme(): Promise<ThemeId> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  return isThemeId(value) ? value : DEFAULT_THEME;
}

export const THEME_COOKIE_NAME = COOKIE_NAME;
