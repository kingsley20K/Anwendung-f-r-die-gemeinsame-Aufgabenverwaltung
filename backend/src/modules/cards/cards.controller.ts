import { Request, Response, NextFunction } from 'express';
import { Server as SocketServer } from 'socket.io';
import { cardsService } from './cards.service';

const emitToBoard = (req: Request, event: string, payload: object) => {
  const io: SocketServer = req.app.get('io');
  const boardId = req.params.boardId;
  const socketId = req.headers['x-socket-id'] as string | undefined;

  const target = socketId
    ? io.to(`board:${boardId}`).except(socketId)
    : io.to(`board:${boardId}`);

  target.emit(event, { ...payload, boardId });
};

export const cardsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const card = await cardsService.create(req.params.columnId, req.user!.id, req.body);
      emitToBoard(req, 'card:created', { card, columnId: req.params.columnId });
      res.status(201).json(card);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const card = await cardsService.update(req.params.cardId, req.body);
      const isMove = req.body.columnId !== undefined || req.body.position !== undefined;
      emitToBoard(req, isMove ? 'card:moved' : 'card:updated', { card, cardId: card.id });
      res.json(card);
    } catch (err) { next(err); }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await cardsService.remove(req.params.cardId);
      emitToBoard(req, 'card:deleted', { cardId: req.params.cardId });
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
