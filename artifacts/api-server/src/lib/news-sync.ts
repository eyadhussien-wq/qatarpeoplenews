import { db } from "@workspace/db";
import { news } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export type NewsSource = "QNA" | "الجزيرة" | "الشرق" | "العرب" | "لوسيل" | "الوطن" | "الديوان الأميري";
export type NewsSourceKind = "rss" | "html";

type FeedItem = {
  title: string;
  link: string;
  description: string | null;
  publishedAt: Date | null;
  isBreaking: boolean;
};

type SourceConfig = {
  name: NewsSource;
  urls: string[];
  kind: NewsSourceKind;
  official: boolean;
  princeNews?: boolean;
};

const MAX_ITEMS_PER_SOURCE = 50;
const MIN_TITLE_LENGTH = 8;
const MAX_TITLE_LENGTH = 320;
const FETCH_TIMEOUT_MS = 15000;

export const NEWS_SOURCE_CONFIG: SourceConfig[] = [
  { name: "QNA", urls: ["https://qna.org.qa/ar-QA/"], kind: "html", official: true },
  // No current official general-news RSS endpoint was confirmed; use the official site adapter.
  { name: "الجزيرة", urls: ["https://www.aljazeera.net/"], kind: "html", official: true },
  { name: "الشرق", urls: ["https://al-sharq.com/rss/latestNews", "https://al-sharq.com/rss"], kind: "rss", official: true },
  { name: "العرب", urls: ["https://alarab.qa/rss/latestNews", "https://alarab.qa/rss"], kind: "rss", official: true },
  { name: "لوسيل", urls: ["https://lusailnews.net/"], kind: "html", official: true },
  { name: "الوطن", urls: ["https://www.al-watan.com/"], kind: "html", official: true },
  // Primary source for HH The Amir news. Never substitute a newspaper re-publication.
  {
    name: "الديوان الأميري",
    urls: [
      "https://diwan.gov.qa/ar-QA/Briefing-Room/News?sc_lang=ar-QA",
      "https://www.diwan.gov.qa/ar-QA/briefing-room/news",
    ],
    kind: "html",
    official: true,
    princeNews: true,
  },
];

function decodeHtml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/\s+/g, " ")
    .trim();
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

function looksBreaking(title: string) {
  return /عاجل|طارئ|الآن|هام جداً|هام جدًا|urgent|breaking/i.test(title);
}

function canonicalUrl(value: string, baseUrl: string) {
  try {
    const url = new URL(value, baseUrl);
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid$|gclid$|mc_cid$|mc_eid$)/i.test(key)) url.searchParams.delete(key);
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

function cleanTitle(value: string) {
  return decodeHtml(value).replace(/[|•·]+/g, " ").replace(/\s+/g, " ").trim();
}

function isUsefulTitle(title: string) {
  if (title.length < MIN_TITLE_LENGTH || title.length > MAX_TITLE_LENGTH) return false;
  return !/^(الرئيسية|الرئيسيه|المزيد|اقرأ المزيد|قراءة المزيد|menu|search|facebook|instagram|twitter|youtube)$/i.test(title);
}

function isLikelyArticleUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (!/^https?:$/i.test(parsed.protocol)) return false;
    const path = parsed.pathname.toLowerCase();
    return path.length > 1 && !/\.(jpg|jpeg|png|gif|webp|svg|pdf)$/i.test(path);
  } catch {
    return false;
  }
}

function dedupeItems(items: FeedItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${canonicalUrl(item.link, item.link)}|${item.title.toLocaleLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseRss(xml: string): FeedItem[] {
  const blocks = [...allBlocks(xml, "item"), ...allBlocks(xml, "entry")];
  return dedupeItems(blocks.map((block) => {
    const linkTag = block.match(/<link(?:\s[^>]*)?>([\s\S]*?)<\/link>/i);
    const href = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?\s*>/i)?.[1] ?? "";
    const link = decodeHtml(href || linkTag?.[1] || "");
    const title = cleanTitle(tag(block, "title"));
    return {
      title,
      link: canonicalUrl(link, link),
      description: tag(block, "description") || tag(block, "summary") || null,
      publishedAt: parseDate(tag(block, "pubDate") || tag(block, "published") || tag(block, "updated") || tag(block, "date")),
      isBreaking: looksBreaking(title),
    };
  })).filter((item) => isUsefulTitle(item.title) && isLikelyArticleUrl(item.link));
}

function parseAnchors(html: string, baseUrl: string, linkPattern: RegExp, max = MAX_ITEMS_PER_SOURCE): FeedItem[] {
  const results: FeedItem[] = [];
  const seen = new Set<string>();

  for (const match of html.matchAll(linkPattern)) {
    const link = canonicalUrl(match[1], baseUrl);
    const title = cleanTitle(match[2]);
    if (!link || !isLikelyArticleUrl(link) || !isUsefulTitle(title) || seen.has(link)) continue;
    seen.add(link);
    results.push({ title, link, description: null, publishedAt: null, isBreaking: looksBreaking(title) });
    if (results.length >= max) break;
  }

  return results;
}

function parseQnaHtml(html: string): FeedItem[] {
  return parseAnchors(
    html,
    "https://qna.org.qa",
    /href=["']([^"']*(?:\/news\/news-details(?:\/|\?|$)|\/news\/)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
  );
}

function parseAlJazeeraHtml(html: string): FeedItem[] {
  return parseAnchors(html, "https://www.aljazeera.net", /href=["']([^"']*\/news\/(?:[^"']+))["'][^>]*>([\s\S]*?)<\/a>/gi);
}

function parseLusailHtml(html: string): FeedItem[] {
  return parseAnchors(html, "https://lusailnews.net", /href=["']([^"']*\/article\/[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi);
}

function parseWatanHtml(html: string): FeedItem[] {
  return parseAnchors(html, "https://www.al-watan.com", /href=["']([^"']*(?:\/article\/|\/news\/)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi);
}

function parseDiwanHtml(html: string): FeedItem[] {
  // The Diwan site uses both Arabic and English casing/path variants. Match the
  // article path, but never generic briefing-room navigation links.
  return parseAnchors(
    html,
    "https://diwan.gov.qa",
    /href=["']([^"']*\/briefing-room\/news(?:\/|\?|#)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
  );
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 100) || `news-${Date.now()}`;
}

async function fetchSource(urls: string[]) {
  let lastError = "Unable to fetch source";
  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; QatarPeopleNews/1.0)",
          accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.9, */*;q=0.8",
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!response.ok) {
        lastError = `HTTP ${response.status} from ${url}`;
        continue;
      }
      return { body: await response.text(), url };
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown fetch error";
    }
  }
  throw new Error(lastError);
}

function parseSource(source: SourceConfig, body: string): FeedItem[] {
  const parsed = source.kind === "rss" ? parseRss(body) : (() => {
    switch (source.name) {
      case "QNA": return parseQnaHtml(body);
      case "الجزيرة": return parseAlJazeeraHtml(body);
      case "لوسيل": return parseLusailHtml(body);
      case "الوطن": return parseWatanHtml(body);
      case "الديوان الأميري": return parseDiwanHtml(body);
      default: return [];
    }
  })();
  return dedupeItems(parsed).slice(0, MAX_ITEMS_PER_SOURCE);
}

export async function syncNewsSources() {
  const summary: Array<{
    source: NewsSource;
    kind: NewsSourceKind;
    official: boolean;
    princeNews: boolean;
    fetched: number;
    inserted: number;
    skipped: number;
    error?: string;
  }> = [];

  for (const source of NEWS_SOURCE_CONFIG) {
    try {
      const { body } = await fetchSource(source.urls);
      const items = parseSource(source, body);
      let inserted = 0;
      let skipped = 0;

      for (const item of items) {
        const existing = await db.select({ id: news.id }).from(news).where(eq(news.sourceUrl, item.link)).limit(1);
        if (existing.length) {
          skipped++;
          continue;
        }

        const [created] = await db.insert(news).values({
          title: item.title,
          slug: `${slugify(item.title)}-${Date.now()}-${inserted}`,
          excerpt: item.description,
          content: item.description || item.title,
          sourceName: source.name,
          sourceUrl: item.link,
          status: "published",
          isBreaking: item.isBreaking,
          publishedAt: item.publishedAt ?? new Date(),
          updatedAt: new Date(),
        }).onConflictDoNothing({ target: news.sourceUrl }).returning({ id: news.id });

        if (created) inserted++;
        else skipped++;
      }

      summary.push({
        source: source.name,
        kind: source.kind,
        official: source.official,
        princeNews: Boolean(source.princeNews),
        fetched: items.length,
        inserted,
        skipped,
      });
    } catch (error) {
      summary.push({
        source: source.name,
        kind: source.kind,
        official: source.official,
        princeNews: Boolean(source.princeNews),
        fetched: 0,
        inserted: 0,
        skipped: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return summary;
}
