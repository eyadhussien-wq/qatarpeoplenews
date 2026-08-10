import { Router } from "express";
import { and, desc, eq, gt, isNull, or } from "drizzle-orm";
import { db } from "@workspace/db";
import { jobs } from "@workspace/db/schema";

const router = Router();

router.get("/jobs", async (_req, res, next) => {
  try {
    const now = new Date();
    const data = await db.select().from(jobs)
      .where(and(eq(jobs.isActive, true), or(isNull(jobs.expiresAt), gt(jobs.expiresAt, now))))
      .orderBy(desc(jobs.createdAt)).limit(100);
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

export default router;
