import { Router } from 'express';
import { z } from 'zod';
import { columnsController } from './columns.controller';
import { cardsController } from '../cards/cards.controller';
import { validateBody } from '../../middleware/validate';

const createColumnSchema = z.object({
  title: z.string().min(1).max(100),
});

const updateColumnSchema = z.object({
  title:    z.string().min(1).max(100).optional(),
  position: z.number().positive().optional(),
});

const createCardSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});

export const columnsRouter = Router({ mergeParams: true });

columnsRouter.post('/',                         validateBody(createColumnSchema), columnsController.create);
columnsRouter.patch('/:columnId',               validateBody(updateColumnSchema), columnsController.update);
columnsRouter.delete('/:columnId',                                                columnsController.remove);
columnsRouter.post('/:columnId/cards',          validateBody(createCardSchema),   cardsController.create);
