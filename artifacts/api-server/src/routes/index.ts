import { Router, type IRouter } from "express";
import healthRouter from "./health";
import radioRouter from "./radio";
import adminRouter from "./admin";
import adminNewsRouter from "./admin-news";
import newsRouter from "./news";
import newsSyncRouter from "./news-sync";

const router: IRouter = Router();

router.use(healthRouter);
router.use(radioRouter);
router.use(adminRouter);
router.use(adminNewsRouter);
router.use(newsRouter);
router.use(newsSyncRouter);

export default router;
