import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AboutTimeline, type TimelineItem } from "./about-timeline";

const items: TimelineItem[] = [
  { label: "起点", title: "程序员", description: "呆过互联网大厂，也呆过国企。" },
  {
    label: "现在",
    title: "自由职业",
    description: "关注 AI 产品。",
    meta: "正在构建 APIPool",
    now: true,
  },
];

describe("AboutTimeline", () => {
  it("renders label, title, description and meta", () => {
    const html = renderToStaticMarkup(<AboutTimeline items={items} />);
    expect(html).toContain("起点");
    expect(html).toContain("程序员");
    expect(html).toContain("呆过互联网大厂");
    expect(html).toContain("正在构建 APIPool");
  });

  it("marks the now item with a modifier class", () => {
    const html = renderToStaticMarkup(<AboutTimeline items={items} />);
    expect(html).toContain("timeline-item--now");
  });

  it("omits meta line when not provided", () => {
    const html = renderToStaticMarkup(<AboutTimeline items={[items[0]]} />);
    expect(html).not.toContain("timeline-meta");
  });
});
