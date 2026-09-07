import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export type RequestPart = "body" | "params" | "query";

export interface ValidatedRequestLocals {
  validated?: Partial<Record<RequestPart, unknown>>;
}

export const validate = <T>(
  schema: z.ZodType<T>,
  part: RequestPart = "body",
) => {
  return (
    req: Request,
    res: Response<unknown, ValidatedRequestLocals>,
    next: NextFunction,
  ) => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      return next(result.error);
    }

    res.locals.validated = {
      ...res.locals.validated,
      [part]: result.data,
    };

    next();
  };
};

export const getValidatedData = <T>(
  res: Response<unknown, ValidatedRequestLocals>,
  part: RequestPart,
): T => {
  const data = res.locals.validated?.[part];

  if (data === undefined) {
    throw new Error(`VALIDATED_${part.toUpperCase()}_NOT_FOUND`);
  }

  return data as T;
};
