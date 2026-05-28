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

    socket.on('reconnect', () => {
      socket!.auth = { token: tokenStore.get() };
    });

    socket.on('card:created', ({ card }) => {
      useBoardStore.getState().applyRemoteCardCreated(card);
    });

    socket.on('card:updated', ({ card }) => {
      useBoardStore.getState().applyRemoteCardMove(card.id, card.columnId, card.position);
    });

    socket.on('card:moved', ({ card }) => {
      useBoardStore.getState().applyRemoteCardMove(card.id, card.columnId, card.position);
    });

    socket.on('card:deleted', ({ cardId }) => {
      useBoardStore.getState().applyRemoteCardDeleted(cardId);
    });

    socket.on('column:created', ({ column }) => {
      useBoardStore.getState().applyRemoteColumnCreated(column);
    });

    socket.on('column:updated', ({ column }) => {
      useBoardStore.getState().applyRemoteColumnUpdated(column);
    });

    socket.on('column:deleted', ({ columnId }) => {
      useBoardStore.getState().applyRemoteColumnDeleted(columnId);
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
