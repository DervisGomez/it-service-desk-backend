import { Router } from "express";
import { serviceTypeController } from "./service-type.controller.js";

const router = Router();

router.get("/", serviceTypeController.getAll);

export default router;
