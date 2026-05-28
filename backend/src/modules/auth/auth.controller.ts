import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';

const REFRESH_COOKIE = 'refreshToken';

const cookieOptions = (nodeEnv: string) => ({
  httpOnly: true,
  secure:   nodeEnv === 'production',
  sameSite: (nodeEnv === 'production' ? 'none' : 'strict') as 'none' | 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000,
  path:     '/api/v1/auth',
});

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions(process.env.NODE_ENV!));
      res.status(201).json({ user: result.user, accessToken: result.accessToken });
    } catch (err) { next(err); }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions(process.env.NODE_ENV!));
      res.json({ user: result.user, accessToken: result.accessToken });
    } catch (err) { next(err); }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.[REFRESH_COOKIE];
      if (!token) return next({ status: 401, code: 'UNAUTHORIZED', message: 'No refresh token' });
      const result = await authService.refresh(token);
      res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions(process.env.NODE_ENV!));
      res.json({ accessToken: result.accessToken });
    } catch (err) { next(err); }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.logout(req.user!.id);
      res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
