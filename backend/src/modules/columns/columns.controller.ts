import { Request, Response, NextFunction } from 'express';
import { Server as SocketServer } from 'socket.io';
import { columnsService } from './columns.service';

const emitToBoard = (req: Request, event: string, payload: object) => {
  const io: SocketServer = req.app.get('io');
  const boardId = req.params.boardId;
  const socketId = req.headers['x-socket-id'] as string | undefined;

  const target = socketId
    ? io.to(`board:${boardId}`).except(socketId)
    : io.to(`board:${boardId}`);

  target.emit(event, { ...payload, boardId });
};

export const columnsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const column = await columnsService.create(req.params.boardId, req.body);
      emitToBoard(req, 'column:created', { column });
      res.status(201).json(column);
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const column = await columnsService.update(req.params.columnId, req.body);
      emitToBoard(req, 'column:updated', { column });
      res.json(column);
    } catch (err) { next(err); }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await columnsService.remove(req.params.columnId);
      emitToBoard(req, 'column:deleted', { columnId: req.params.columnId });
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
