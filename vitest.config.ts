import { configDefaults, defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
  test: {
    // 默认 node；需要 DOM 的测试用文件顶部 docblock 指定：
    //   // @vitest-environment jsdom
    environment: "node",
    exclude: [...configDefaults.exclude, ".next/**", ".open-next/**"],
  },
});
