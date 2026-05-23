import { HomePage } from "./home-page";
import { AboutPage } from "./about-page";
import { ProductsPage } from "./products-page";
import { WritingListPage } from "./writing-list-page";
import { WritingPostPage } from "./writing-post-page";

/**
 * Annual 主题的 5 个 page 级组件。
 * 在 dispatch.tsx 中通过 PageKey 索引被使用，因此键名必须对齐：
 *   "home" | "about" | "products" | "writingList" | "writingPost"
 */
export const Annual = {
  home: HomePage,
  about: AboutPage,
  products: ProductsPage,
  writingList: WritingListPage,
  writingPost: WritingPostPage,
};
