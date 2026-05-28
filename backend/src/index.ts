import './config/env';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { authRouter } from './modules/auth/auth.router';
import { usersRouter } from './modules/users/users.router';
import { boardsRouter } from './modules/boards/boards.router';
import { errorHandler } from './middleware/errorHandler';
import { initSocketServer } from './sockets/socket.server';
import { apiRateLimiter, authRateLimiter, searchRateLimiter } from './middleware/rateLimiter';

const app = express();
const httpServer = createServer(app);
const io = initSocketServer(httpServer);

app.set('io', io);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'ws:', 'wss:'],
    },
  },
  strictTransportSecurity: env.NODE_ENV === 'production'
    ? { maxAge: 31_536_000, includeSubDomains: true }
    : false,
  frameguard: { action: 'deny' },
  noSniff: true,
}));

app.use(cors({
  origin: env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Socket-Id'],
  credentials: true,
  maxAge: 86400,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1', apiRateLimiter);
app.use('/api/v1/auth/login',    authRateLimiter);
app.use('/api/v1/auth/register', authRateLimiter);
app.use('/api/v1/users',         searchRateLimiter);

app.use('/api/v1/auth',   authRouter);
app.use('/api/v1/users',  usersRouter);
app.use('/api/v1/boards', boardsRouter);

app.use(errorHandler);

httpServer.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
