/**
 * 内联防闪脚本：在 React 接管前同步根据 localStorage 改 <html data-theme>。
 *
 * 注意：这里的主题白名单数组是手写副本，无法 import lib/themes.ts——脚本
 * 要在 hydration 前作为字符串求值，import 会变成异步模块加载。
 * 加新主题时必须同步改两处。
 */
export function ThemeInit() {
  const script =
    "(function(){try{" +
    "var t=localStorage.getItem('theme');" +
    "if(t&&['sand','ink','mist','moss','editorial','terminal'].indexOf(t)>=0){" +
    "document.documentElement.dataset.theme=t" +
    "}}catch(e){}})();";
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
