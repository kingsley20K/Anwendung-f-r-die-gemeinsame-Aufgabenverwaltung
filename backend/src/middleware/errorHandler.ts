import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (!err.status || err.status >= 500) {
    console.error(err);
  }

  res.status(err.status ?? 500).json({
    error: {
      code:    err.code    ?? 'INTERNAL_ERROR',
      message: err.message ?? 'An unexpected error occurred',
      ...(err.details && { details: err.details }),
    },
  });
};
