import { describe, expect, it } from "vitest";
import { siteConfig } from "./site-config";

describe("siteConfig.socials", () => {
  it("lists the main channels first: 公众号, 知乎, X", () => {
    expect(siteConfig.socials.map((s) => s.icon)).toEqual([
      "wechat",
      "zhihu",
      "x",
      "github",
      "email",
      "rss",
    ]);
  });

  it("points every web link at a real profile instead of a bare domain", () => {
    for (const social of siteConfig.socials) {
      if (!social.href.startsWith("http")) continue;
      const url = new URL(social.href);
      expect(url.pathname.length, social.label).toBeGreaterThan(1);
    }
    const byIcon = Object.fromEntries(siteConfig.socials.map((s) => [s.icon, s.href]));
    expect(byIcon.zhihu).toBe("https://www.zhihu.com/people/afreecoder");
    expect(byIcon.x).toBe("https://x.com/afreecoder");
  });

  it("serves the 公众号 QR code from OSS with the account name", () => {
    const wechat = siteConfig.socials.find((s) => s.icon === "wechat")!;
    expect(wechat.account).toBe("码农的自由之路");
    expect(new URL(wechat.href).hostname).toBe("tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com");
  });
});
