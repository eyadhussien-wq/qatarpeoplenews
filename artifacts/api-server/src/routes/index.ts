import { Router, type IRouter } from "express";
import healthRouter from "./health";
import radioRouter from "./radio";
import adminRouter from "./admin";
import adminNewsRouter from "./admin-news";
import newsRouter from "./news";

const router: IRouter = Router();

router.use(healthRouter);
router.use(radioRouter);
router.use(adminRouter);
router.use(adminNewsRouter);
router.use(newsRouter);

export default router;
