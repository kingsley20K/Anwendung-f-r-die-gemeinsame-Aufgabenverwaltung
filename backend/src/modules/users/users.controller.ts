import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';

export const usersController = {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.getById(req.user!.id);
      res.json(user);
    } catch (err) { next(err); }
  },

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await usersService.update(req.user!.id, req.body);
      res.json(user);
    } catch (err) { next(err); }
  },

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.query;
      if (email && typeof email === 'string') {
        const user = await usersService.findByEmail(email);
        return res.json(user);
      }
      // No email param → return all users
      const users = await usersService.listAll();
      res.json({ users });
    } catch (err) { next(err); }
  },
};
