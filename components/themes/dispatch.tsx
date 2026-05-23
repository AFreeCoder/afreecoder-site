import type { ComponentType } from "react";
import type { ThemeId } from "@/lib/themes";
import { Annual } from "./annual";

export type PageKey = "home" | "about" | "products" | "writingList" | "writingPost";

const REGISTRY: Record<ThemeId, Partial<Record<PageKey, ComponentType<any>>>> = {
  annual:    Annual,
  workshop:  {},
  nocturne:  {},
  telegraph: {},
};

export function pickThemedPage(theme: ThemeId, key: PageKey): ComponentType<any> {
  return REGISTRY[theme][key] ?? Annual[key];
}
