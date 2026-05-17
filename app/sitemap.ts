import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getAllWriting } from "@/lib/writing";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.domain;
  const writings = await getAllWriting();
  const writingUrls = writings.map((p) => ({
    url: `${base}/writing/${p.slug}`,
    lastModified: p.date,
  }));
  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
    { url: `${base}/products`, lastModified: new Date() },
    { url: `${base}/writing`, lastModified: new Date() },
    ...writingUrls,
  ];
}
