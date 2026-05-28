import './config/env';
import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { authRouter } from './modules/auth/auth.router';
import { usersRouter } from './modules/users/users.router';
import { boardsRouter } from './modules/boards/boards.router';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());

app.use('/api/v1/auth',   authRouter);
app.use('/api/v1/users',  usersRouter);
app.use('/api/v1/boards', boardsRouter);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
