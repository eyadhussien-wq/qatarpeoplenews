import { Router, type IRouter } from "express";
import healthRouter from "./health";
import radioRouter from "./radio";
import adminRouter from "./admin";
import newsRouter from "./news";

const router: IRouter = Router();

router.use(healthRouter);
router.use(radioRouter);
router.use(adminRouter);
router.use(newsRouter);

export default router;
