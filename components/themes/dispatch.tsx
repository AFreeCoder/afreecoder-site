import { createElement, type ComponentType, type ReactNode } from "react";
import type { ThemeId } from "@/lib/themes";
import { Annual } from "./annual";

export type PageKey = "home" | "about" | "products" | "writingList" | "writingPost";

type AnyComponent = ComponentType<Record<string, unknown>>;

const REGISTRY: Record<ThemeId, Partial<Record<PageKey, AnyComponent>>> = {
  annual:    Annual as Record<PageKey, AnyComponent>,
  workshop:  {},
  nocturne:  {},
  telegraph: {},
};

/**
 * 服务端 dispatch：按主题选 page 组件并立即 createElement，
 * 避免在调用方写 `const Page = ...` 触发 react-hooks/static-components。
 */
export function renderThemedPage(
  theme: ThemeId,
  key: PageKey,
  props: Record<string, unknown>,
): ReactNode {
  const Cmp = REGISTRY[theme][key] ?? (Annual as Record<PageKey, AnyComponent>)[key];
  return createElement(Cmp, props);
}

/** 仅用于测试断言：返回某主题某 page 的组件引用 */
export function pickThemedPage(theme: ThemeId, key: PageKey): AnyComponent {
  return REGISTRY[theme][key] ?? (Annual as Record<PageKey, AnyComponent>)[key];
}
