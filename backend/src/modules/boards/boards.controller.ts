import { Request, Response, NextFunction } from 'express';
import { boardsService } from './boards.service';

export const boardsController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const boards = await boardsService.list(req.user!.id);
      res.json({ boards });
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const board = await boardsService.create(req.user!.id, req.body);
      res.status(201).json(board);
    } catch (err) { next(err); }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const board = await boardsService.getOne(req.params.boardId);
      res.json(board);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const board = await boardsService.update(req.params.boardId, req.body);
      res.json(board);
    } catch (err) { next(err); }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await boardsService.remove(req.params.boardId);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async listMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const members = await boardsService.listMembers(req.params.boardId);
      res.json({ members });
    } catch (err) { next(err); }
  },

  async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await boardsService.addMember(req.params.boardId, req.body);
      res.status(201).json(member);
    } catch (err) { next(err); }
  },

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      await boardsService.removeMember(req.params.boardId, req.params.userId);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
