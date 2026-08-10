import { Router } from "express";
import { desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { communityPosts } from "@workspace/db/schema";

const router = Router();

router.get("/community", async (_req, res, next) => {
  try {
    const data = await db.select().from(communityPosts).orderBy(desc(communityPosts.createdAt)).limit(100);
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

export default router;
