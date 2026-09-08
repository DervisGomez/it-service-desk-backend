import { NextFunction, Request, Response } from "express";
import { successResponse } from "../../utils/api-response.js";
import { serviceTypeService } from "./service-type.service.js";

export class ServiceTypeController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const serviceTypes = await serviceTypeService.getActive();
      return successResponse(
        res,
        serviceTypes,
        "Tipos de servicio obtenidos correctamente",
      );
    } catch (error) {
      next(error);
    }
  }
}

export const serviceTypeController = new ServiceTypeController();
