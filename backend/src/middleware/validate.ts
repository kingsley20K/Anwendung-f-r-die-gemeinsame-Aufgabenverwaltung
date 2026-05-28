import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validateBody = (schema: z.ZodSchema) => (
  req: Request, res: Response, next: NextFunction
) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Invalid request body',
      details: result.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }
  req.body = result.data;
  next();
};
