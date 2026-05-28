import { Request, Response, NextFunction } from 'express';
import { columnsService } from './columns.service';

export const columnsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const column = await columnsService.create(req.params.boardId, req.body);
      res.status(201).json(column);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const column = await columnsService.update(req.params.columnId, req.body);
      res.json(column);
    } catch (err) { next(err); }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await columnsService.remove(req.params.columnId);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
