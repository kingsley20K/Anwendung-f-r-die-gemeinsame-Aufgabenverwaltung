import { Router } from 'express';
import { z } from 'zod';
import { boardsController } from './boards.controller';
import { authenticate } from '../../middleware/auth';
import { requireBoardMember, requireBoardOwner } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validate';
import { columnsRouter } from '../columns/columns.router';
import { cardsRouter } from '../cards/cards.router';

const createBoardSchema = z.object({
  title:       z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

const updateBoardSchema = z.object({
  title:       z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

const addMemberSchema = z.object({
  userId: z.string().uuid(),
  role:   z.enum(['member', 'owner']).default('member'),
});

export const boardsRouter = Router();

boardsRouter.get('/',    authenticate, boardsController.list);
boardsRouter.post('/',   authenticate, validateBody(createBoardSchema), boardsController.create);

boardsRouter.get('/:boardId',    authenticate, requireBoardMember, boardsController.getOne);
boardsRouter.patch('/:boardId',  authenticate, requireBoardMember, validateBody(updateBoardSchema), boardsController.update);
boardsRouter.delete('/:boardId', authenticate, requireBoardMember, requireBoardOwner, boardsController.remove);

boardsRouter.get('/:boardId/members',              authenticate, requireBoardMember, boardsController.listMembers);
boardsRouter.post('/:boardId/members',             authenticate, requireBoardMember, requireBoardOwner, validateBody(addMemberSchema), boardsController.addMember);
boardsRouter.delete('/:boardId/members/:userId',   authenticate, requireBoardMember, requireBoardOwner, boardsController.removeMember);

boardsRouter.use('/:boardId/columns', authenticate, requireBoardMember, columnsRouter);
boardsRouter.use('/:boardId/cards',   authenticate, requireBoardMember, cardsRouter);
