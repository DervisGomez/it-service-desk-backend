import { Prisma } from "@prisma/client";
import type { ErrorRequestHandler } from "express";
import { z } from "zod";
import { errorResponse } from "../utils/api-response.js";

const domainErrors: Record<string, { message: string; code: string }> = {
  REQUEST_NOT_FOUND: {
    message: "La solicitud no existe",
    code: "REQUEST_NOT_FOUND",
  },
  TECHNICIAN_NOT_FOUND: {
    message: "El técnico no existe",
    code: "TECHNICIAN_NOT_FOUND",
  },
  SERVICE_TYPE_NOT_FOUND: {
    message: "El tipo de servicio no existe",
    code: "SERVICE_TYPE_NOT_FOUND",
  },
};

export const errorMiddleware: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next,
) => {
  if (error instanceof z.ZodError) {
    return errorResponse(
      res,
      "Los datos enviados no son válidos",
      "VALIDATION_ERROR",
      400,
      error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  if (error instanceof Error && error.message in domainErrors) {
    const domainError = domainErrors[error.message];
    return errorResponse(res, domainError.message, domainError.code, 404);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return errorResponse(res, "El recurso ya existe", "CONFLICT", 409);
    }

    if (error.code === "P2025") {
      return errorResponse(res, "El recurso no existe", "RESOURCE_NOT_FOUND", 404);
    }

    if (error.code === "P2003") {
      return errorResponse(
        res,
        "No se puede completar la operación por una relación inválida",
        "RELATION_CONSTRAINT_ERROR",
        409,
      );
    }
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }

  return errorResponse(
    res,
    "Ocurrió un error interno. Intenta nuevamente más tarde",
    "INTERNAL_SERVER_ERROR",
    500,
  );
};
