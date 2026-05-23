import { cookies } from "next/headers";
import {
  COLOR_SCHEME_COOKIE,
  DEFAULT_COLOR_SCHEME,
  isColorScheme,
  type ColorScheme,
} from "./color-scheme";

export async function getColorScheme(): Promise<ColorScheme> {
  const store = await cookies();
  const value = store.get(COLOR_SCHEME_COOKIE)?.value;
  return isColorScheme(value) ? value : DEFAULT_COLOR_SCHEME;
}
