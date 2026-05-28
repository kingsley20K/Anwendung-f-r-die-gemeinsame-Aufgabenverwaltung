import { create } from 'zustand';
import type { Board, Card, Column } from '../types';

interface BoardState {
  board: Board | null;
  isLoading: boolean;

  loadBoard: (boardId: string) => Promise<void>;
  clearBoard: () => void;

  moveCardOptimistic: (cardId: string, toColumnId: string, position: number) => void;
  rollbackCard: (cardId: string, fromColumnId: string, originalPosition: number) => void;

  applyRemoteCardMove: (cardId: string, toColumnId: string, position: number) => void;
  applyRemoteCardCreated: (card: Card) => void;
  applyRemoteCardDeleted: (cardId: string) => void;
  applyRemoteColumnCreated: (column: Column) => void;
  applyRemoteColumnUpdated: (column: Column) => void;
  applyRemoteColumnDeleted: (columnId: string) => void;
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
    set({ board: null });
  },

  moveCardOptimistic(cardId, toColumnId, position) {
    set((state) => {
      if (!state.board) return state;
      return { board: moveCard(state.board, cardId, toColumnId, position) };
    });
  },

  rollbackCard(cardId, fromColumnId, originalPosition) {
    get().moveCardOptimistic(cardId, fromColumnId, originalPosition);
  },

  applyRemoteCardMove(cardId, toColumnId, position) {
    get().moveCardOptimistic(cardId, toColumnId, position);
  },

  applyRemoteCardCreated(card) {
    set((state) => {
      if (!state.board) return state;
      const columns = state.board.columns.map((col) =>
        col.id === card.columnId
          ? { ...col, cards: [...col.cards, card].sort((a, b) => a.position - b.position) }
          : col,
      );
      return { board: { ...state.board, columns } };
    });
  },

  applyRemoteCardDeleted(cardId) {
    set((state) => {
      if (!state.board) return state;
      const columns = state.board.columns.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => c.id !== cardId),
      }));
      return { board: { ...state.board, columns } };
    });
  },

  applyRemoteColumnCreated(column) {
    set((state) => {
      if (!state.board) return state;
      const columns = [...state.board.columns, { ...column, cards: [] }]
        .sort((a, b) => a.position - b.position);
      return { board: { ...state.board, columns } };
    });
  },

  applyRemoteColumnUpdated(column) {
    set((state) => {
      if (!state.board) return state;
      const columns = state.board.columns
        .map((col) => col.id === column.id ? { ...col, ...column } : col)
        .sort((a, b) => a.position - b.position);
      return { board: { ...state.board, columns } };
    });
  },

  applyRemoteColumnDeleted(columnId) {
    set((state) => {
      if (!state.board) return state;
      return { board: { ...state.board, columns: state.board.columns.filter((c) => c.id !== columnId) } };
    });
  },
}));
