import { Router } from 'express';
import { z } from 'zod';
import { cardsController } from './cards.controller';
import { validateBody } from '../../middleware/validate';

const updateCardSchema = z.object({
  title:       z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  columnId:    z.string().uuid().optional(),
  position:    z.number().positive().optional(),
});

export const cardsRouter = Router({ mergeParams: true });

cardsRouter.patch('/:cardId',  validateBody(updateCardSchema), cardsController.update);
cardsRouter.delete('/:cardId',                                 cardsController.remove);
