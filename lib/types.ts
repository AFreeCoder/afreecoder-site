export type Product = {
  name: string;
  description: string;
  role: string;
  phase: string;
  highlight: string;
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
  bodyFormat?: "markdown" | "html";
  source_file?: string;
};

export type WritingMeta = WritingFrontmatter & {
  readingTime: number; // minutes
};
