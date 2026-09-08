import { NextFunction, Request, Response } from "express";
import {
  getValidatedData,
  type ValidatedRequestLocals,
} from "../../middlewares/validate.middleware.js";
import { errorResponse, successResponse } from "../../utils/api-response.js";
import { RequestService, requestService } from "./request.service.js";
import type {
  CreateRequestInput,
  RequestIdParams,
  UpdateRequestInput,
} from "./request.schemas.js";
import type { RequestFilters } from "./request.types.js";

type ValidatedResponse = Response<unknown, ValidatedRequestLocals>;

const handleRequestNotFound = (
  error: unknown,
  res: Response,
  next: NextFunction,
) => {
  if (error instanceof Error && error.message === "REQUEST_NOT_FOUND") {
    return errorResponse(
      res,
      "La solicitud no existe",
      "REQUEST_NOT_FOUND",
      404,
    );
  }

  return next(error);
};

export class RequestController {
  constructor(
    private readonly service: RequestService = requestService,
  ) {}

  async getAll(_req: Request, res: ValidatedResponse, next: NextFunction) {
    try {
      const filters = getValidatedData<RequestFilters>(res, "query");
      const { requests, total, page, limit, totalPages } =
        await this.service.getAll(filters);

      return successResponse(
        res,
        requests,
        "Solicitudes obtenidas correctamente",
        200,
        {
          pagination: { page, limit, total, totalPages },
        },
      );
    } catch (error) {
      next(error);
    }
  }

  async getById(_req: Request, res: ValidatedResponse, next: NextFunction) {
    try {
      const { id } = getValidatedData<RequestIdParams>(res, "params");
      const request = await this.service.getById(id);
      return successResponse(res, request, "Solicitud obtenida correctamente");
    } catch (error) {
      handleRequestNotFound(error, res, next);
    }
  }

  async create(_req: Request, res: ValidatedResponse, next: NextFunction) {
    try {
      const input = getValidatedData<CreateRequestInput>(res, "body");
      const request = await this.service.create(input);
      return successResponse(
        res,
        request,
        "Solicitud creada correctamente",
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  async update(_req: Request, res: ValidatedResponse, next: NextFunction) {
    try {
      const { id } = getValidatedData<RequestIdParams>(res, "params");
      const input = getValidatedData<UpdateRequestInput>(res, "body");
      const request = await this.service.update(id, input);
      return successResponse(
        res,
        request,
        "Solicitud actualizada correctamente",
      );
    } catch (error) {
      handleRequestNotFound(error, res, next);
    }
  }

  async delete(_req: Request, res: ValidatedResponse, next: NextFunction) {
    try {
      const { id } = getValidatedData<RequestIdParams>(res, "params");
      await this.service.delete(id);
      return successResponse(res, null, "Solicitud eliminada correctamente");
    } catch (error) {
      handleRequestNotFound(error, res, next);
    }
  }

  async dashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const dashboard = await this.service.getDashboard();
      return successResponse(
        res,
        dashboard,
        "Dashboard obtenido correctamente",
      );
    } catch (error) {
      next(error);
    }
  }
}

export const requestController = new RequestController();
