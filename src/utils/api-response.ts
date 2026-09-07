import { Response } from "express";

export const successResponse = <T>(
  res: Response,
  data: T,
  message = "Operación exitosa",
  statusCode = 200,
  meta?: unknown,
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
    message,
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  code: string,
  statusCode: number,
  errors?: unknown,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(errors ? { errors } : {}),
  });
};
