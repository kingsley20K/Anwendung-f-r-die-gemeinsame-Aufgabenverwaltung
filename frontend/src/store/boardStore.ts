import { create } from 'zustand';
import type { Board, Card, Column } from '../types';

export interface PresenceUser {
  userId: string;
  email: string;
  displayName: string;
}

interface BoardState {
  board: Board | null;
  isLoading: boolean;
  presenceUsers: PresenceUser[];

  loadBoard:  (boardId: string) => Promise<void>;
  clearBoard: () => void;

  moveCardOptimistic: (cardId: string, toColumnId: string, position: number) => void;
  rollbackCard:       (cardId: string, fromColumnId: string, originalPosition: number) => void;

  applyRemoteCardMove:         (cardId: string, toColumnId: string, position: number) => void;
  applyRemoteCardUpdated:      (card: Card) => void;
  applyRemoteCardCreated:      (card: Card) => void;
  applyRemoteCardDeleted:      (cardId: string) => void;
  applyRemoteColumnCreated:    (column: Column) => void;
  applyRemoteColumnUpdated:    (column: Column) => void;
  applyRemoteColumnDeleted:    (columnId: string) => void;
  applyRemoteBoardTitleUpdated:(title: string) => void;

  addPresenceUser:  (user: PresenceUser) => void;
  removePresenceUser:(userId: string) => void;
  setPresenceUsers: (users: PresenceUser[]) => void;
}

function moveCard(board: Board, cardId: string, toColumnId: string, position: number): Board {
  let movedCard: Card | undefined;
  const withoutCard = board.columns.map((col) => {
    const card = col.cards.find((c) => c.id === cardId);
    if (card) {
      movedCard = { ...card, columnId: toColumnId, position };
      return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
    }
    return col;
  });
  if (!movedCard) return board;
  const withCard = withoutCard.map((col) =>
    col.id === toColumnId
      ? { ...col, cards: [...col.cards, movedCard!].sort((a, b) => a.position - b.position) }
      : col,
  );
  return { ...board, columns: withCard };
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: null,
  isLoading: false,
  presenceUsers: [],

  async loadBoard(boardId) {
    set({ isLoading: true });
    try {
      const { getBoardById } = await import('../api/endpoints/boards.api');
      const board = await getBoardById(boardId);
      set({ board, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  clearBoard() {
    set({ board: null, presenceUsers: [] });
  },

  moveCardOptimistic(cardId, toColumnId, position) {
    set((s) => s.board ? { board: moveCard(s.board, cardId, toColumnId, position) } : s);
  },

  rollbackCard(cardId, fromColumnId, originalPosition) {
    get().moveCardOptimistic(cardId, fromColumnId, originalPosition);
  },

  applyRemoteCardMove(cardId, toColumnId, position) {
    get().moveCardOptimistic(cardId, toColumnId, position);
  },

  // Handles both field updates (title/description) and cross-column moves
  applyRemoteCardUpdated(card) {
    set((s) => {
      if (!s.board) return s;
      const withoutCard = s.board.columns.map((col) => ({
        ...col, cards: col.cards.filter((c) => c.id !== card.id),
      }));
      const withCard = withoutCard.map((col) =>
        col.id === card.columnId
          ? { ...col, cards: [...col.cards, card].sort((a, b) => a.position - b.position) }
          : col,
      );
      return { board: { ...s.board, columns: withCard } };
    });
  },

  applyRemoteCardCreated(card) {
    set((s) => {
      if (!s.board) return s;
      const exists = s.board.columns.some((col) => col.cards.some((c) => c.id === card.id));
      if (exists) return s;
      const columns = s.board.columns.map((col) =>
        col.id === card.columnId
          ? { ...col, cards: [...col.cards, card].sort((a, b) => a.position - b.position) }
          : col,
      );
      return { board: { ...s.board, columns } };
    });
  },

  applyRemoteCardDeleted(cardId) {
    set((s) => {
      if (!s.board) return s;
      const columns = s.board.columns.map((col) => ({
        ...col, cards: col.cards.filter((c) => c.id !== cardId),
      }));
      return { board: { ...s.board, columns } };
    });
  },

  applyRemoteColumnCreated(column) {
    set((s) => {
      if (!s.board) return s;
      const exists = s.board.columns.some((col) => col.id === column.id);
      if (exists) return s;
      const columns = [...s.board.columns, { ...column, cards: [] }]
        .sort((a, b) => a.position - b.position);
      return { board: { ...s.board, columns } };
    });
  },

  applyRemoteColumnUpdated(column) {
    set((s) => {
      if (!s.board) return s;
      const columns = s.board.columns
        .map((col) => col.id === column.id ? { ...col, ...column } : col)
        .sort((a, b) => a.position - b.position);
      return { board: { ...s.board, columns } };
    });
  },

  applyRemoteColumnDeleted(columnId) {
    set((s) => {
      if (!s.board) return s;
      return { board: { ...s.board, columns: s.board.columns.filter((c) => c.id !== columnId) } };
    });
  },

  applyRemoteBoardTitleUpdated(title) {
    set((s) => s.board ? { board: { ...s.board, title } } : s);
  },

  addPresenceUser(user) {
    set((s) => ({
      presenceUsers: s.presenceUsers.some((u) => u.userId === user.userId)
        ? s.presenceUsers
        : [...s.presenceUsers, user],
    }));
  },

  removePresenceUser(userId) {
    set((s) => ({ presenceUsers: s.presenceUsers.filter((u) => u.userId !== userId) }));
  },

  setPresenceUsers(users) {
    set({ presenceUsers: users });
  },
}));
