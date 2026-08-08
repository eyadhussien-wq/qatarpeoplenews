import { Router } from "express";
import { and, desc, eq, ilike } from "drizzle-orm";
import { db, news, newsCategories } from "@workspace/db";
import { requireAdmin } from "./admin";

const router = Router();

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 120) || `news-${Date.now()}`;
}
function validateNewsBody(body: unknown) {
  const input = body as Record<string, unknown> | null;
  const title = typeof input?.title === "string" ? input.title.trim() : "";
  const content = typeof input?.content === "string" ? input.content.trim() : "";
  if (title.length < 3 || title.length > 240) return { error: "Title must be between 3 and 240 characters" };
  if (!content) return { error: "Content is required" };
  const status = input?.status === "published" || input?.status === "archived" || input?.status === "draft" ? input.status : "draft";
  const categoryId = typeof input?.categoryId === "string" && input.categoryId.length > 0 ? input.categoryId : null;
  const excerpt = typeof input?.excerpt === "string" ? input.excerpt.trim().slice(0, 500) : null;
  const coverImageUrl = typeof input?.coverImageUrl === "string" ? input.coverImageUrl.trim() : null;
  const videoUrl = typeof input?.videoUrl === "string" ? input.videoUrl.trim() : null;
  return { value: { title, content, status, categoryId, excerpt, coverImageUrl, videoUrl, isBreaking: input?.isBreaking === true } };
}

router.get("/news", async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number.parseInt(String(req.query.limit ?? "20"), 10) || 20, 1), 100);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const rows = await db.select({ id: news.id, title: news.title, slug: news.slug, excerpt: news.excerpt, coverImageUrl: news.coverImageUrl, videoUrl: news.videoUrl, categoryId: news.categoryId, status: news.status, isBreaking: news.isBreaking, views: news.views, publishedAt: news.publishedAt, createdAt: news.createdAt, updatedAt: news.updatedAt, categoryName: newsCategories.name, categorySlug: newsCategories.slug }).from(news).leftJoin(newsCategories, eq(news.categoryId, newsCategories.id)).where(and(eq(news.status, "published"), search ? ilike(news.title, `%${search}%`) : undefined)).orderBy(desc(news.isBreaking), desc(news.publishedAt), desc(news.createdAt)).limit(limit);
    return res.json({ data: rows });
  } catch (error) { return next(error); }
});

router.get("/admin/news", requireAdmin, async (req, res, next) => {
  try {
    const status = req.query.status === "draft" || req.query.status === "published" || req.query.status === "archived" ? req.query.status : undefined;
    const rows = await db.select().from(news).where(status ? eq(news.status, status) : undefined).orderBy(desc(news.createdAt)).limit(200);
    return res.json({ data: rows });
  } catch (error) { return next(error); }
});

router.post("/admin/news", requireAdmin, async (req, res, next) => {
  try {
    const parsed = validateNewsBody(req.body);
    if ("error" in parsed) return res.status(400).json({ error: parsed.error });
    const { value } = parsed; const now = new Date();
    const [created] = await db.insert(news).values({ title: value.title, slug: `${slugify(value.title)}-${Date.now()}`, content: value.content, excerpt: value.excerpt, coverImageUrl: value.coverImageUrl, videoUrl: value.videoUrl, categoryId: value.categoryId, status: value.status, isBreaking: value.isBreaking, publishedAt: value.status === "published" ? now : null, updatedAt: now }).returning();
    return res.status(201).json({ data: created });
  } catch (error) { return next(error); }
});

router.get("/admin/news/categories", requireAdmin, async (_req, res, next) => {
  try { return res.json({ data: await db.select().from(newsCategories).orderBy(newsCategories.name) }); } catch (error) { return next(error); }
});
router.post("/admin/news/categories", requireAdmin, async (req, res, next) => {
  try {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    if (name.length < 2 || name.length > 80) return res.status(400).json({ error: "Category name must be between 2 and 80 characters" });
    const [created] = await db.insert(newsCategories).values({ name, slug: `${slugify(name)}-${Date.now()}` }).returning();
    return res.status(201).json({ data: created });
  } catch (error) { return next(error); }
});

router.get("/news/:id", async (req, res, next) => {
  try {
    const [row] = await db.select({ id: news.id, title: news.title, slug: news.slug, excerpt: news.excerpt, content: news.content, coverImageUrl: news.coverImageUrl, videoUrl: news.videoUrl, categoryId: news.categoryId, status: news.status, isBreaking: news.isBreaking, views: news.views, publishedAt: news.publishedAt, createdAt: news.createdAt, updatedAt: news.updatedAt, category: { id: newsCategories.id, name: newsCategories.name, slug: newsCategories.slug } }).from(news).leftJoin(newsCategories, eq(news.categoryId, newsCategories.id)).where(eq(news.id, req.params.id)).limit(1);
    if (!row || row.status !== "published") return res.status(404).json({ error: "News not found" });
    return res.json({ data: row });
  } catch (error) { return next(error); }
});

router.patch("/admin/news/:id", requireAdmin, async (req, res, next) => {
  try {
    const parsed = validateNewsBody(req.body);
    if ("error" in parsed) return res.status(400).json({ error: parsed.error });
    const { value } = parsed; const now = new Date();
    const [updated] = await db.update(news).set({ title: value.title, content: value.content, excerpt: value.excerpt, coverImageUrl: value.coverImageUrl, videoUrl: value.videoUrl, categoryId: value.categoryId, status: value.status, isBreaking: value.isBreaking, publishedAt: value.status === "published" ? now : null, updatedAt: now }).where(eq(news.id, req.params.id)).returning();
    if (!updated) return res.status(404).json({ error: "News not found" });
    return res.json({ data: updated });
  } catch (error) { return next(error); }
});
router.delete("/admin/news/:id", requireAdmin, async (req, res, next) => {
  try {
    const [updated] = await db.update(news).set({ status: "archived", updatedAt: new Date() }).where(eq(news.id, req.params.id)).returning({ id: news.id });
    if (!updated) return res.status(404).json({ error: "News not found" });
    return res.json({ ok: true, id: updated.id });
  } catch (error) { return next(error); }
});

export default router;
