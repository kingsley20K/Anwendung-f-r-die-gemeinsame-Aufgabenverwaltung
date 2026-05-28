import './config/env';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { authRouter } from './modules/auth/auth.router';
import { usersRouter } from './modules/users/users.router';
import { boardsRouter } from './modules/boards/boards.router';
import { errorHandler } from './middleware/errorHandler';
import { initSocketServer } from './sockets/socket.server';

const app = express();
const httpServer = createServer(app);
const io = initSocketServer(httpServer);

app.set('io', io);

app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth',   authRouter);
app.use('/api/v1/users',  usersRouter);
app.use('/api/v1/boards', boardsRouter);

app.use(errorHandler);

httpServer.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
