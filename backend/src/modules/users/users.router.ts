import { Router } from 'express';
import { z } from 'zod';
import { usersController } from './users.controller';
import { authenticate } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';

const updateMeSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
});

export const usersRouter = Router();

usersRouter.get('/me',   authenticate, usersController.getMe);
usersRouter.patch('/me', authenticate, validateBody(updateMeSchema), usersController.updateMe);
usersRouter.get('/',     authenticate, usersController.search);
