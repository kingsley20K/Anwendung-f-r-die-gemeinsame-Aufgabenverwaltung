import { Request, Response, NextFunction } from 'express';
import { cardsService } from './cards.service';

export const cardsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const card = await cardsService.create(req.params.columnId, req.user!.id, req.body);
      res.status(201).json(card);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const card = await cardsService.update(req.params.cardId, req.body);
      res.json(card);
    } catch (err) { next(err); }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await cardsService.remove(req.params.cardId);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
