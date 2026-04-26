import { Router, type IRouter } from "express";
import healthRouter from "./health";
import volunteersRouter from "./volunteers";
import emergenciesRouter from "./emergencies";
import analyticsRouter from "./analytics";
import analyzeRouter from "./analyze";

const router: IRouter = Router();

router.use(healthRouter);
router.use(volunteersRouter);
router.use(emergenciesRouter);
router.use(analyticsRouter);
router.use(analyzeRouter);

export default router;
