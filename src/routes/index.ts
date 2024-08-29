import { Router } from "express";
import { MeasureController } from "../controllers/mansure.controller";
const router = Router();

const measureController = new MeasureController();
router.post("/upload", measureController.upload.bind(measureController));
router.patch("/confirm", measureController.confirm.bind(measureController));
router.get(
    "/:customerCode/list",
    measureController.list.bind(measureController)
);

export default router;
