import { customFetch } from "./custom-fetch";

export type NewsCategory = { id: string; name: string; slug: string } | null;
export type NewsSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  videoUrl: string | null;
  categoryId: string | null;
  status: "draft" | "published" | "archived";
  isBreaking: boolean;
  views: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  categoryName?: string | null;
  categorySlug?: string | null;
};

export type NewsDetail = NewsSummary & { content: string; category: NewsCategory };

export async function listPublishedNews(params: { limit?: number; search?: string } = {}) {
  const query = new URLSearchParams();
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search?.trim()) query.set("search", params.search.trim());
  const suffix = query.toString() ? `?${query}` : "";
  return customFetch<{ data: NewsSummary[] }>(`/api/news${suffix}`, { responseType: "json" });
}

export async function getPublishedNews(id: string) {
  return customFetch<{ data: NewsDetail }>(`/api/news/${encodeURIComponent(id)}`, { responseType: "json" });
}
