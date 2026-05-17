export type Product = {
  name: string;
  description: string;
  tags: string[];
  link?: string;
  status: "active" | "archived";
};

export type WritingFrontmatter = {
  title: string;
  date: string; // YYYY-MM-DD
  slug: string;
  summary?: string;
  original_url?: string;
  platforms?: string[];
};

export type WritingMeta = WritingFrontmatter & {
  readingTime: number; // minutes
};
