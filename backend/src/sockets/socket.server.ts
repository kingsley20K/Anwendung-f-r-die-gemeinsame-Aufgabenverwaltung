import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { supabaseAdmin } from '../config/db';
import { registerSocketHandlers } from './socket.handlers';

declare module 'socket.io' {
  interface Socket {
    user: { id: string; email: string };
  }
}

export function initSocketServer(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('UNAUTHORIZED'));

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) return next(new Error('UNAUTHORIZED'));

    socket.user = { id: data.user.id, email: data.user.email! };
    next();
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.user.id} (${socket.id})`);
    registerSocketHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.user.id} — reason: ${reason}`);
    });
  });

  return io;
}
