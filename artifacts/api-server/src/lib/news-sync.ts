import { db } from "@workspace/db";
import { news } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export type NewsSource = "QNA" | "الشرق" | "العرب";

type FeedItem = { title: string; link: string; description: string | null; publishedAt: Date | null };

const SOURCES: Array<{ name: NewsSource; urls: string[]; kind: "rss" | "html" }> = [
  { name: "الشرق", urls: ["https://al-sharq.com/rss/latestNews", "https://al-sharq.com/rss"], kind: "rss" },
  { name: "العرب", urls: ["https://alarab.qa/rss/latestNews", "https://alarab.qa/rss"], kind: "rss" },
  { name: "QNA", urls: ["https://qna.org.qa/ar-QA/"], kind: "html" },
];

function decodeHtml(value: string) {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/\s+/g, " ").trim();
}
function tag(xml: string, name: string) {
  const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decodeHtml(m[1]) : "";
}
function allBlocks(xml: string, name: string) {
  return [...xml.matchAll(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "gi"))].map((m) => m[1]);
}
function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
function parseRss(xml: string): FeedItem[] {
  const blocks = allBlocks(xml, "item");
  return blocks.map((block) => ({ title: tag(block, "title"), link: tag(block, "link"), description: tag(block, "description") || null, publishedAt: parseDate(tag(block, "pubDate") || tag(block, "published") || tag(block, "date")) })).filter((item) => item.title && /^https?:\/\//i.test(item.link));
}
function parseQnaHtml(html: string): FeedItem[] {
  const results: FeedItem[] = [];
  const seen = new Set<string>();
  const patterns = [
    /href=["']([^"']*(?:\/news\/news-details|\/news\/)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
    /href=["']([^"']+)["'][^>]*>([\s\S]*?(?:خبر|رئيس|قطر|الدوحة)[\s\S]*?)<\/a>/gi,
  ];
  for (const re of patterns) {
    for (const match of html.matchAll(re)) {
      let link: string;
      try { link = new URL(match[1], "https://qna.org.qa").toString(); } catch { continue; }
      if (seen.has(link)) continue;
      const title = decodeHtml(match[2]);
      if (title.length < 8 || title.length > 300) continue;
      seen.add(link);
      results.push({ title, link, description: null, publishedAt: null });
      if (results.length >= 30) break;
    }
    if (results.length >= 30) break;
  }
  return results;
}
function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 100) || `news-${Date.now()}`;
}

async function fetchSource(urls: string[]) {
  let lastError = "Unable to fetch source";
  for (const url of urls) {
    try {
      const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (compatible; QatarPeopleNews/1.0)", accept: "application/rss+xml, application/xml, text/xml, text/html;q=0.9, */*;q=0.8" }, signal: AbortSignal.timeout(15000) });
      if (!response.ok) { lastError = `HTTP ${response.status} from ${url}`; continue; }
      return { body: await response.text(), url };
    } catch (error) { lastError = error instanceof Error ? error.message : "Unknown fetch error"; }
  }
  throw new Error(lastError);
}

export async function syncNewsSources() {
  const summary: Array<{ source: NewsSource; fetched: number; inserted: number; skipped: number; error?: string }> = [];
  for (const source of SOURCES) {
    try {
      const { body } = await fetchSource(source.urls);
      const items = source.kind === "rss" ? parseRss(body) : parseQnaHtml(body);
      let inserted = 0;
      let skipped = 0;
      for (const item of items) {
        const existing = await db.select({ id: news.id }).from(news).where(eq(news.sourceUrl, item.link)).limit(1);
        if (existing.length) { skipped++; continue; }
        await db.insert(news).values({ title: item.title, slug: `${slugify(item.title)}-${Date.now()}-${inserted}`, excerpt: item.description, content: item.description || item.title, sourceName: source.name, sourceUrl: item.link, status: "published", isBreaking: false, publishedAt: item.publishedAt ?? new Date(), updatedAt: new Date() });
        inserted++;
      }
      summary.push({ source: source.name, fetched: items.length, inserted, skipped });
    } catch (error) {
      summary.push({ source: source.name, fetched: 0, inserted: 0, skipped: 0, error: error instanceof Error ? error.message : "Unknown error" });
    }
  }
  return summary;
}
