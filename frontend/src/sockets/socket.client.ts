import { io, Socket } from 'socket.io-client';
import { tokenStore } from '../api/tokenStore';
import { useBoardStore } from '../store/boardStore';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL ?? 'http://localhost:3000', {
      auth: { token: tokenStore.get() },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      autoConnect: false,
    });

    socket.on('connect_error', (err) => {
      if (err.message === 'TOKEN_EXPIRED' || err.message === 'UNAUTHORIZED') {
        socket!.auth = { token: tokenStore.get() };
        socket!.connect();
      }
    });

    socket.on('reconnect', async () => {
      socket!.auth = { token: tokenStore.get() };
    });

    socket.on('card:created', ({ card, columnId, boardId }) => {
      useBoardStore.getState().applyCardCreated(card, columnId);
    });

    socket.on('card:updated', ({ card }) => {
      useBoardStore.getState().applyCardUpdated(card);
    });

    socket.on('card:moved', ({ card }) => {
      useBoardStore.getState().applyCardUpdated(card);
    });

    socket.on('card:deleted', ({ cardId, columnId }) => {
      useBoardStore.getState().applyCardDeleted(cardId, columnId);
    });

    socket.on('column:created', ({ column }) => {
      useBoardStore.getState().applyColumnCreated(column);
    });

    socket.on('column:updated', ({ column }) => {
      useBoardStore.getState().applyColumnUpdated(column);
    });

    socket.on('column:deleted', ({ columnId }) => {
      useBoardStore.getState().applyColumnDeleted(columnId);
    });
  }

  return socket;
}

export function connectSocket() {
  const s = getSocket();
  s.auth = { token: tokenStore.get() };
  s.connect();
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function joinBoard(boardId: string) {
  getSocket().emit('board:join', { boardId });
}

export function leaveBoard(boardId: string) {
  getSocket().emit('board:leave', { boardId });
}
