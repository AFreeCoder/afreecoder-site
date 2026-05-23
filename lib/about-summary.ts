import { aboutMdx } from "@/content/about";

/**
 * 从 aboutMdx 抽出前 N 段普通正文，跳过 ## 标题与列表项。
 * 用于首页 about block 摘要展示（详情走 /about 全文渲染）。
 */
export function getAboutLead(maxParagraphs = 3): string[] {
  const lines = aboutMdx.split("\n");
  const paras: string[] = [];
  let inSection = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("## ")) { inSection = true; continue; }
    if (inSection) continue;
    if (!line || /^[#-]/.test(line)) continue;
    if (paras.length >= maxParagraphs) break;
    paras.push(line);
  }
  return paras;
}
