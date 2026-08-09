import { Router } from "express";
import { syncNewsSources } from "../lib/news-sync";
import { requireAdmin } from "./admin";

const router = Router();

router.post("/admin/news/sync", requireAdmin, async (_req, res, next) => {
  try {
    const summary = await syncNewsSources();
    return res.json({ ok: true, summary });
  } catch (error) {
    return next(error);
  }
});

export default router;
