import { NextFunction, Request, Response } from "express";
import { successResponse } from "../../utils/api-response.js";
import { technicianService } from "./technician.service.js";

export class TechnicianController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const technicians = await technicianService.getActive();
      return successResponse(
        res,
        technicians,
        "Técnicos obtenidos correctamente",
      );
    } catch (error) {
      next(error);
    }
  }
}

export const technicianController = new TechnicianController();
