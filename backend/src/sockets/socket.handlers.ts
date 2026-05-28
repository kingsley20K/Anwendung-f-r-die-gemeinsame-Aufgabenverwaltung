import { Server as SocketServer, Socket } from 'socket.io';
import { supabaseAdmin } from '../config/db';

export function registerSocketHandlers(io: SocketServer, socket: Socket) {
  socket.on('board:join', async ({ boardId }: { boardId: string }) => {
    const { data } = await supabaseAdmin
      .from('board_members')
      .select('role')
      .eq('board_id', boardId)
      .eq('user_id', socket.user.id)
      .single();

    if (!data) {
      socket.emit('error', { code: 'FORBIDDEN', message: 'Not a board member' });
      return;
    }

    const room = `board:${boardId}`;
    await socket.join(room);

    socket.to(room).emit('presence:joined', { userId: socket.user.id, boardId });
    socket.emit('board:joined', { boardId });
  });

  socket.on('board:leave', async ({ boardId }: { boardId: string }) => {
    const room = `board:${boardId}`;
    await socket.leave(room);
    socket.to(room).emit('presence:left', { userId: socket.user.id, boardId });
  });
}
