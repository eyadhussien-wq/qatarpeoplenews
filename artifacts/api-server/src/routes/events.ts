import { Router } from "express";
import { asc, desc, gt, or, isNull } from "drizzle-orm";
import { db } from "@workspace/db";
import { events } from "@workspace/db/schema";

const router = Router();

router.get("/events", async (_req, res, next) => {
  try {
    const now = new Date();
    const data = await db.select().from(events)
      .where(or(gt(events.startsAt, now), isNull(events.endsAt)))
      .orderBy(asc(events.startsAt), desc(events.createdAt)).limit(100);
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
});

export default router;
