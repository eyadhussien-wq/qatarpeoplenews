import { customFetch } from "./custom-fetch";

export type NewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content?: string;
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

export async function getNews(options?: { limit?: number; search?: string; signal?: AbortSignal }) {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.search) params.set("search", options.search);
  const query = params.toString();
  return customFetch<{ data: NewsItem[] }>(`/api/news${query ? `?${query}` : ""}`, {
    method: "GET",
    responseType: "json",
    signal: options?.signal,
  });
}

export async function getNewsItem(id: string, options?: { signal?: AbortSignal }) {
  return customFetch<{ data: NewsItem }>(`/api/news/${encodeURIComponent(id)}`, {
    method: "GET",
    responseType: "json",
    signal: options?.signal,
  });
}
