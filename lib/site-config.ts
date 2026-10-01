export type SocialIconKey = "wechat" | "zhihu" | "github" | "x" | "email" | "rss";

export type SocialLink = {
  icon: SocialIconKey;
  label: string;
  /** 公众号没有网页主页，这里放二维码图片地址 */
  href: string;
  /** 公众号名称，扫码弹层里展示 */
  account?: string;
};

export type NavItem = {
  label: string;
  href: string;
};

export const siteConfig = {
  name: "AFreeCoder",
  domain: "https://afreecoder.dev",
  description:
    "A-Free-Coder，一个追求自由的 Coder。记录自由职业、AI、产品和写作。",
  taglines: {
    primary: "独立开发者，关注 AI 产品与写作。",
    secondary: "用代码记录追求自由的过程。",
  },
  now: {
    building: "APIPool",
    link: "https://app.apipool.dev",
    note: "对产品合作与交流开放",
  },
  socials: [
    {
      icon: "wechat",
      label: "微信公众号",
      account: "码农的自由之路",
      href: "https://tjjsjwhj-blog.oss-cn-beijing.aliyuncs.com/article-publish-assistant/a088281940d27e9323ae4cffe034b1218e0399e8b49ef4bb5da3b92570f8c4f5.jpg",
    },
    { icon: "zhihu",  label: "知乎",   href: "https://www.zhihu.com/people/afreecoder" },
    { icon: "x",      label: "X / Twitter", href: "https://x.com/afreecoder" },
    { icon: "github", label: "GitHub", href: "https://github.com/AFreeCoder" },
    { icon: "email",  label: "Email", href: "mailto:hello@afreecoder.dev" },
    { icon: "rss",    label: "RSS",   href: "/rss.xml" },
  ] as SocialLink[],
  nav: [
    { label: "主页", href: "/"        },
    { label: "关于", href: "/about"   },
    { label: "产品", href: "/products" },
    { label: "文章", href: "/writing"  },
    { label: "AI 新鲜事", href: "https://aihot.afreecoder.dev" },
  ] as NavItem[],
} as const;
