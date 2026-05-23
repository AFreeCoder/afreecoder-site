import { products } from "@/content/products";
import { getAllWriting } from "@/lib/writing";

export type Stats = {
  since: string;
  sinceYear: number;
  yearsActive: number;
  volRoman: string;
  postCount: number;
  productLiveCount: number;
  productArchivedCount: number;
  uptimeDays: number;
};

export function toRoman(n: number): string {
  if (n <= 0) return "";
  const pairs: Array<[number, string]> = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
    [100, "C"],  [90, "XC"],  [50, "L"],  [40, "XL"],
    [10, "X"],   [9, "IX"],   [5, "V"],   [4, "IV"], [1, "I"],
  ];
  let out = "";
  let v = n;
  for (const [k, sym] of pairs) {
    while (v >= k) { out += sym; v -= k; }
  }
  return out;
}

function formatSinceDate(iso: string): string {
  return iso.replaceAll("-", ".");
}

export async function getSiteStats(): Promise<Stats> {
  const posts = await getAllWriting();
  const dates = posts.map((p) => p.date).sort();
  const earliestIso = dates[0] ?? "2019-06-05";
  const earliest = new Date(earliestIso + "T00:00:00Z");
  const now = new Date();
  const sinceYear = earliest.getUTCFullYear();
  const currentYear = now.getUTCFullYear();
  const yearsActive = currentYear - sinceYear;

  return {
    since: formatSinceDate(earliestIso),
    sinceYear,
    yearsActive,
    volRoman: toRoman(yearsActive + 1),
    postCount: posts.length,
    productLiveCount: products.filter((p) => p.status === "active").length,
    productArchivedCount: products.filter((p) => p.status === "archived").length,
    uptimeDays: Math.floor((now.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24)),
  };
}

export function fillTemplate(template: string, stats: Stats): string {
  return template
    .replaceAll("{{since}}",                stats.since)
    .replaceAll("{{sinceYear}}",            String(stats.sinceYear))
    .replaceAll("{{years}}",                String(stats.yearsActive))
    .replaceAll("{{volRoman}}",             stats.volRoman)
    .replaceAll("{{postCount}}",            String(stats.postCount))
    .replaceAll("{{productLiveCount}}",     String(stats.productLiveCount))
    .replaceAll("{{productArchivedCount}}", String(stats.productArchivedCount))
    .replaceAll("{{uptimeDays}}",           String(stats.uptimeDays));
}
