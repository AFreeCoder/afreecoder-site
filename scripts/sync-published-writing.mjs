import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, join } from "node:path";

const repoUrl = "https://github.com/AFreeCoder/AFreeCoder.github.io.git";
const repoDir =
  process.env.AFREECODER_GITHUB_PAGES_DIR ?? "/tmp/afreecoder-github-pages";
const localPublishedDir =
  process.env.AFREECODER_PUBLISHED_DIR ??
  "/Users/afreecoder/Nutstore Files/工作空间/我的笔记/40_outbox/published";
const siteOrigin = "https://afreecoder.cn";
const markdownDir = "content/writing";
const outputFile = "content/writing-posts.ts";

function ensureRepo() {
  const searchFile = join(repoDir, "local-search.xml");
  if (existsSync(searchFile)) return;

  rmSync(repoDir, { recursive: true, force: true });
  execFileSync("git", ["clone", "--depth=1", repoUrl, repoDir], {
    stdio: "inherit",
  });
}

function decodeEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_match, code) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
}

function extractTag(source, tagName) {
  const match = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`).exec(
    source,
  );
  return match ? decodeEntities(match[1].trim()) : "";
}

function extractContent(source) {
  return (
    /<content\s+type="html"><!\[CDATA\[([\s\S]*?)\]\]><\/content>/.exec(
      source,
    )?.[1]?.trim() ?? ""
  );
}

function parseFrontmatter(source) {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(source);
  if (!match) return { data: {}, body: source };

  const data = {};
  for (const line of match[1].split("\n")) {
    const item = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (item) data[item[1]] = item[2].trim();
  }

  return { data, body: source.slice(match[0].length).trim() };
}

function normalizeTitle(title) {
  return title
    .normalize("NFKC")
    .replace(/[\s。？?！!，,、：《》【】（）()“”‘’"'`~·.\-—_:：#]/g, "")
    .toLowerCase();
}

function attr(tag, name) {
  return (
    new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i").exec(tag)?.[1] ??
    new RegExp(`${name}\\s*=\\s*'([^']*)'`, "i").exec(tag)?.[1] ??
    ""
  );
}

function normalizeAbsoluteUrl(path) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("//")) return `https:${path}`;
  if (path.startsWith("/")) return `${siteOrigin}${path}`;
  return path;
}

function cleanHtml(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<a\b[^>]*class="[^"]*\bheaderlink\b[^"]*"[^>]*><\/a>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*"[^"]*"/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*'[^']*'/gi, "")
    .replace(/\s+(href|src)\s*=\s*["']javascript:[^"']*["']/gi, "")
    .replace(/\s+(href|src)="(\/(?!\/)[^"]*)"/gi, (_match, name, url) => {
      return ` ${name}="${normalizeAbsoluteUrl(url)}"`;
    })
    .replace(/\s+(href|src)='(\/(?!\/)[^']*)'/gi, (_match, name, url) => {
      return ` ${name}='${normalizeAbsoluteUrl(url)}'`;
    })
    .trim();
}

function codeText(html) {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/?span\b[^>]*>/gi, "")
      .replace(/<[^>]+>/g, ""),
  ).replace(/\n+$/g, "");
}

function inlineMarkdown(html) {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<img\b([^>]*)>/gi, (_match, attrs) => {
        const src = normalizeAbsoluteUrl(attr(attrs, "src"));
        const alt = decodeEntities(attr(attrs, "alt"));
        return src ? `![${alt}](${src})` : "";
      })
      .replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_match, inner) => {
        const text = codeText(inner).replace(/`/g, "\\`");
        return `\`${text}\``;
      })
      .replace(/<strong\b[^>]*>([\s\S]*?)<\/strong>/gi, (_match, inner) => {
        return `**${inlineMarkdown(inner).trim()}**`;
      })
      .replace(/<em\b[^>]*>([\s\S]*?)<\/em>/gi, (_match, inner) => {
        return `*${inlineMarkdown(inner).trim()}*`;
      })
      .replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (_match, attrs, inner) => {
        const href = normalizeAbsoluteUrl(attr(attrs, "href"));
        const text = inlineMarkdown(inner).trim();
        return href && text ? `[${text}](${href})` : text;
      })
      .replace(/<\/?span\b[^>]*>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n"),
  ).trim();
}

function tableToMarkdown(tableHtml) {
  const rows = [...tableHtml.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(
    (row) =>
      [...row[1].matchAll(/<(?:th|td)\b[^>]*>([\s\S]*?)<\/(?:th|td)>/gi)].map(
        (cell) => inlineMarkdown(cell[1]).replace(/\|/g, "\\|").replace(/\n/g, " "),
      ),
  );
  if (rows.length === 0) return "";

  const width = Math.max(...rows.map((row) => row.length));
  const normalizedRows = rows.map((row) => [
    ...row,
    ...Array.from({ length: width - row.length }, () => ""),
  ]);
  const [header, ...body] = normalizedRows;
  return [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...body.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function listToMarkdown(kind, body) {
  const ordered = kind === "ol";
  const items = [...body.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map(
    (item) => inlineMarkdown(item[1]).replace(/\n/g, "\n  "),
  );
  return items
    .map((item, index) => `${ordered ? `${index + 1}.` : "-"} ${item}`)
    .join("\n");
}

function htmlToMarkdown(html) {
  let markdown = cleanHtml(html);

  markdown = markdown.replace(
    /<figure\b[^>]*class="[^"]*\bhighlight\s+([a-z0-9_-]+)[^"]*"[^>]*>[\s\S]*?<td\b[^>]*class="[^"]*\bcode\b[^"]*"[^>]*>\s*<pre><code\b[^>]*>([\s\S]*?)<\/code><\/pre>\s*<\/td>[\s\S]*?<\/figure>/gi,
    (_match, language, code) => `\n\n\`\`\`${language}\n${codeText(code)}\n\`\`\`\n\n`,
  );
  markdown = markdown.replace(
    /<pre><code\b[^>]*class="[^"]*\bhljs\s+([a-z0-9_-]+)[^"]*"[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    (_match, language, code) => `\n\n\`\`\`${language}\n${codeText(code)}\n\`\`\`\n\n`,
  );
  markdown = markdown.replace(
    /<pre><code\b[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    (_match, code) => `\n\n\`\`\`\n${codeText(code)}\n\`\`\`\n\n`,
  );
  markdown = markdown.replace(/<div\b[^>]*class="[^"]*\btable-container\b[^"]*"[^>]*>/gi, "");
  markdown = markdown.replace(/<table\b[^>]*>[\s\S]*?<\/table>/gi, (table) => {
    return `\n\n${tableToMarkdown(table)}\n\n`;
  });
  markdown = markdown.replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, (_match, inner) => {
    const quote = inlineMarkdown(inner)
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n");
    return `\n\n${quote}\n\n`;
  });
  markdown = markdown.replace(/<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_match, level, inner) => {
    return `\n\n${"#".repeat(Number(level))} ${inlineMarkdown(inner)}\n\n`;
  });
  markdown = markdown.replace(/<(ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_match, kind, body) => {
    return `\n\n${listToMarkdown(kind, body)}\n\n`;
  });
  markdown = markdown.replace(/<hr\s*\/?>/gi, "\n\n---\n\n");
  markdown = markdown.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (_match, inner) => {
    return `\n\n${inlineMarkdown(inner)}\n\n`;
  });
  markdown = inlineMarkdown(markdown.replace(/<\/?div\b[^>]*>/gi, "\n\n"));

  return markdown
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function plainText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[[^\]]+]\([^)]+\)/g, " ")
    .replace(/[#>*_`|~\-[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function loadLocalPosts() {
  const posts = readdirSync(localPublishedDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const source = readFileSync(join(localPublishedDir, file), "utf8");
      const { data, body } = parseFrontmatter(source);
      const title = data.title || basename(file, ".md");
      return {
        file,
        title,
        normalizedTitle: normalizeTitle(title),
        body,
        bodyText: normalizeTitle(plainText(body).slice(0, 600)),
        data,
      };
    });

  return posts;
}

function similarity(a, b) {
  const left = new Set();
  const right = new Set();
  for (let index = 0; index < a.length - 1; index++) left.add(a.slice(index, index + 2));
  for (let index = 0; index < b.length - 1; index++) right.add(b.slice(index, index + 2));
  let overlap = 0;
  for (const gram of left) {
    if (right.has(gram)) overlap += 1;
  }
  return overlap / Math.max(1, Math.min(left.size, right.size));
}

function extractImagesFromHtml(html) {
  return [...html.matchAll(/<img\b([^>]*)>/gi)].map((match) => ({
    src: normalizeAbsoluteUrl(attr(match[1], "src")),
    alt: decodeEntities(attr(match[1], "alt")),
  }));
}

function replaceMarkdownImages(body, images) {
  let index = 0;
  return body.replace(
    /!\[([^\]]*)\]\(([^)]+)\)|!\[\[([^\]]+)]]/g,
    (match, markdownAlt, markdownUrl, wikiTarget) => {
      const image = images[index];
      index += 1;
      if (!image?.src) return match;

      const alt = markdownAlt ?? image.alt ?? "";
      if (wikiTarget) return `![${alt}](${image.src})`;
      return `![${alt}](${image.src})`;
    },
  );
}

function isQrImageLine(line) {
  return /^!\[[^\]]*]\([^)]+\)$/.test(line) && /公众号二维码|gongzhonghaopic/i.test(line);
}

function isPromoLine(line) {
  const text = line.replace(/^\*+|\*+$/g, "").trim();
  return /都看到这里|赞\/在看|加个关注|点个赞|不如点个/u.test(text);
}

function stripArticleTail(body) {
  let removedPromo = false;
  const lines = body
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      if (isQrImageLine(trimmed) || isPromoLine(trimmed)) {
        removedPromo = true;
        return false;
      }
      return true;
    });
  let end = lines.length;

  const trimTrailingBlankLines = () => {
    while (end > 0 && lines[end - 1].trim() === "") end -= 1;
  };

  trimTrailingBlankLines();

  while (removedPromo && end > 0) {
    if (lines[end - 1].trim() === "---") {
      end -= 1;
      trimTrailingBlankLines();
      continue;
    }
    break;
  }

  return lines.slice(0, end).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function findLocalPost(entry, localPosts, usedLocalFiles) {
  const normalizedTitle = normalizeTitle(entry.title);
  const exact = localPosts.find(
    (post) => post.normalizedTitle === normalizedTitle && !usedLocalFiles.has(post.file),
  );
  if (exact) return exact;

  const scored = localPosts
    .filter((post) => !usedLocalFiles.has(post.file))
    .map((post) => ({
      post,
      score: similarity(normalizeTitle(plainText(entry.body).slice(0, 600)), post.bodyText),
    }))
    .sort((a, b) => b.score - a.score);

  return scored[0]?.score > 0.5 ? scored[0].post : null;
}

function dateFromLink(link) {
  const match = /^\/(\d{4})\/(\d{2})\/(\d{2})\//.exec(link);
  if (!match) return "";
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function slugFromLink(link) {
  return link.split("/").filter(Boolean).at(-1) ?? "";
}

function uniqueSlug(slug, key, usedSlugs) {
  if (!usedSlugs.has(slug)) {
    usedSlugs.add(slug);
    return slug;
  }

  const suffix = createHash("sha1").update(key).digest("hex").slice(0, 7);
  const unique = `${slug}-${suffix}`;
  usedSlugs.add(unique);
  return unique;
}

function gitRevision() {
  try {
    return execFileSync("git", ["-C", repoDir, "rev-parse", "--short", "HEAD"], {
      encoding: "utf8",
    }).trim();
  } catch {
    return "unknown";
  }
}

function parseEntries(xml) {
  const usedSlugs = new Set();
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? [];

  return entries
    .map((entry) => {
      const title = extractTag(entry, "title");
      const link = /<link\s+href="([^"]+)"\s*\/>/.exec(entry)?.[1] ?? "";
      const slug = uniqueSlug(slugFromLink(link), link, usedSlugs);
      const html = extractContent(entry);
      const body = htmlToMarkdown(html);

      return {
        title,
        date: dateFromLink(link),
        slug,
        original_url: normalizeAbsoluteUrl(link),
        body,
        html,
        images: extractImagesFromHtml(html),
      };
    })
    .filter((entry) => entry.title && entry.date && entry.slug && entry.body);
}

function parsePosts(xml) {
  const localPosts = loadLocalPosts();
  const usedLocalFiles = new Set();
  const stats = { local: 0, fallback: 0 };

  const posts = parseEntries(xml)
    .map((entry) => {
      const localPost = findLocalPost(entry, localPosts, usedLocalFiles);
      const restoredBody = localPost
        ? replaceMarkdownImages(localPost.body, entry.images)
        : entry.body;
      const body = stripArticleTail(restoredBody);
      if (localPost) usedLocalFiles.add(localPost.file);
      if (localPost) stats.local += 1;
      else stats.fallback += 1;
      const summary = plainText(body).slice(0, 140);

      return {
        title: entry.title,
        date: entry.date,
        slug: entry.slug,
        summary,
        original_url: entry.original_url,
        platforms: localPost?.data.platform ? [localPost.data.platform] : ["AFreeCoder.github.io"],
        bodyFormat: "markdown",
        body,
        source_file: localPost ? join(localPublishedDir, localPost.file) : undefined,
      };
    })
    .filter((post) => post.title && post.date && post.slug && post.body)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return a.title.localeCompare(b.title, "zh-Hans-CN");
    });

  posts.stats = stats;
  return posts;
}

function frontmatter(post) {
  return [
    "---",
    `title: ${post.title}`,
    `date: ${post.date}`,
    `slug: ${post.slug}`,
    `original_url: ${post.original_url}`,
    ...(post.source_file ? [`source_file: ${post.source_file}`] : []),
    "platforms:",
    ...post.platforms.map((platform) => `  - ${platform}`),
    "bodyFormat: markdown",
    "---",
    "",
  ].join("\n");
}

function writeMarkdownFiles(posts) {
  mkdirSync(markdownDir, { recursive: true });
  for (const file of readdirSync(markdownDir)) {
    if (file.endsWith(".md")) rmSync(join(markdownDir, file));
  }

  for (const post of posts) {
    writeFileSync(join(markdownDir, `${post.slug}.md`), `${frontmatter(post)}${post.body}\n`);
  }
}

ensureRepo();

const searchFile = join(repoDir, "local-search.xml");
const xml = readFileSync(searchFile, "utf8");
const posts = parsePosts(xml);
const stats = posts.stats;
const revision = gitRevision();

if (posts.length === 0) {
  throw new Error(`No posts parsed from ${searchFile}`);
}

writeMarkdownFiles(posts);

const output = `import type { WritingFrontmatter } from "@/lib/types";

export type WritingSource = WritingFrontmatter & {
  body: string;
};

// Generated from ${repoUrl} (${revision})
// Source file: local-search.xml
// Restored Markdown files: content/writing/*.md
// Run \`pnpm sync:writing\` after refreshing the GitHub Pages repository.
export const writingPosts: WritingSource[] = ${JSON.stringify(posts, null, 2)};
`;

writeFileSync(outputFile, output);
console.log(
  `Wrote ${posts.length} Markdown files to ${markdownDir} and updated ${outputFile}`,
);
console.log(`Matched local Markdown: ${stats.local}; HTML fallback: ${stats.fallback}`);
