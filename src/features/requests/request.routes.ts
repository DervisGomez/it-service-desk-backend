import { Router } from "express";

import { validate } from "../../middlewares/validate.middleware.js";
import {
  RequestController,
  requestController,
} from "./request.controller.js";
import {
  createRequestSchema,
  requestIdSchema,
  requestQuerySchema,
  updateRequestSchema,
} from "./request.schemas.js";

export const createRequestRoutes = (
  controller: RequestController = requestController,
) => {
  const router = Router();

  router.get(
    "/",
    validate(requestQuerySchema, "query"),
    controller.getAll.bind(controller),
  );

  router.get(
    "/dashboard",
    controller.dashboard.bind(controller),
  );

  router.get(
    "/:id",
    validate(requestIdSchema, "params"),
    controller.getById.bind(controller),
  );

  router.post(
    "/",
    validate(createRequestSchema),
    controller.create.bind(controller),
  );

  router.put(
    "/:id",
    validate(requestIdSchema, "params"),
    validate(updateRequestSchema),
    controller.update.bind(controller),
  );

  router.delete(
    "/:id",
    validate(requestIdSchema, "params"),
    controller.delete.bind(controller),
  );

  return router;
};

export default createRequestRoutes();