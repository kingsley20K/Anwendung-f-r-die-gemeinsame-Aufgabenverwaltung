import { Router } from 'express';
import { z } from 'zod';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';

const registerSchema = z.object({
  email:       z.string().email(),
  password:    z.string().min(8),
  displayName: z.string().min(2).max(50),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string(),
});

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), authController.register);
authRouter.post('/login',    validateBody(loginSchema),    authController.login);
// refresh token comes from httpOnly cookie — no body validation needed
authRouter.post('/refresh',  authController.refresh);
authRouter.post('/logout',   authenticate,                 authController.logout);
