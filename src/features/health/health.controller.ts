import { NextFunction, Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/api-response.js";
import { healthService } from "./health.service.js";

export class HealthController {
  live(_req: Request, res: Response) {
    return successResponse(res, { status: "ok" }, "API disponible");
  }

  async ready(_req: Request, res: Response, next: NextFunction) {
    try {
      const isReady = await healthService.isReady();

      if (!isReady) {
        return errorResponse(
          res,
          "API no disponible temporalmente",
          "SERVICE_UNAVAILABLE",
          503,
        );
      }

      return successResponse(
        res,
        { status: "ready", database: "connected" },
        "API lista para recibir solicitudes",
      );
    } catch (error) {
      next(error);
    }
  }
}

export const healthController = new HealthController();
