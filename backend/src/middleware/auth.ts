import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/db';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next({ status: 401, code: 'UNAUTHORIZED', message: 'Missing token' });
  }

  const token = header.slice(7);
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    const code = error?.message?.includes('expired') ? 'TOKEN_EXPIRED' : 'UNAUTHORIZED';
    return next({ status: 401, code, message: 'Invalid token' });
  }

  req.user = { id: data.user.id, email: data.user.email! };
  next();
};
