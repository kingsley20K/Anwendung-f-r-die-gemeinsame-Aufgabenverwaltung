import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (err) { next(err); }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (err) { next(err); }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.refresh(req.body.refreshToken);
      res.json(result);
    } catch (err) { next(err); }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization!.slice(7);
      await authService.logout(token);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
