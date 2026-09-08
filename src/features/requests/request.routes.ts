import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { requestController } from "./request.controller.js";
import {
  createRequestSchema,
  requestIdSchema,
  requestQuerySchema,
  updateRequestSchema,
} from "./request.schemas.js";

const router = Router();

router.get("/", validate(requestQuerySchema, "query"), requestController.getAll);
router.get("/dashboard", requestController.dashboard);
router.get("/:id", validate(requestIdSchema, "params"), requestController.getById);
router.post("/", validate(createRequestSchema), requestController.create);
router.put(
  "/:id",
  validate(requestIdSchema, "params"),
  validate(updateRequestSchema),
  requestController.update,
);
router.delete("/:id", validate(requestIdSchema, "params"), requestController.delete);

export default router;
