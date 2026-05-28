import { create } from 'zustand';

export interface Card {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  position: number;
  createdAt: string;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  position: number;
  cards: Card[];
}

interface BoardState {
  boardId: string | null;
  columns: Column[];

  setBoard: (boardId: string, columns: Column[]) => void;
  clearBoard: () => void;

  // Optimistic updates (local-first)
  moveCardOptimistic: (cardId: string, targetColumnId: string, position: number) => void;
  rollbackCard: (cardId: string, originalColumnId: string, originalPosition: number) => void;

  // Applied from WebSocket events
  applyCardCreated: (card: Card, columnId: string) => void;
  applyCardUpdated: (card: Card) => void;
  applyCardDeleted: (cardId: string, columnId: string) => void;
  applyColumnCreated: (column: Column) => void;
  applyColumnUpdated: (column: Column) => void;
  applyColumnDeleted: (columnId: string) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boardId: null,
  columns: [],

  setBoard(boardId, columns) {
    set({ boardId, columns: [...columns].sort((a, b) => a.position - b.position) });
  },

  clearBoard() {
    set({ boardId: null, columns: [] });
  },

  moveCardOptimistic(cardId, targetColumnId, position) {
    set((state) => {
      const card = state.columns.flatMap(c => c.cards).find(c => c.id === cardId);
      if (!card) return state;
      return {
        columns: state.columns.map(col => ({
          ...col,
          cards: col.id === targetColumnId
            ? [...col.cards.filter(c => c.id !== cardId), { ...card, columnId: targetColumnId, position }]
                .sort((a, b) => a.position - b.position)
            : col.cards.filter(c => c.id !== cardId),
        })),
      };
    });
  },

  rollbackCard(cardId, originalColumnId, originalPosition) {
    get().moveCardOptimistic(cardId, originalColumnId, originalPosition);
  },

  applyCardCreated(card, columnId) {
    set((state) => ({
      columns: state.columns.map(col =>
        col.id === columnId
          ? { ...col, cards: [...col.cards, card].sort((a, b) => a.position - b.position) }
          : col,
      ),
    }));
  },

  applyCardUpdated(card) {
    set((state) => ({
      columns: state.columns.map(col => ({
        ...col,
        cards: col.id === card.columnId
          ? [...col.cards.filter(c => c.id !== card.id), card].sort((a, b) => a.position - b.position)
          : col.cards.filter(c => c.id !== card.id),
      })),
    }));
  },

  applyCardDeleted(cardId, columnId) {
    set((state) => ({
      columns: state.columns.map(col =>
        col.id === columnId
          ? { ...col, cards: col.cards.filter(c => c.id !== cardId) }
          : col,
      ),
    }));
  },

  applyColumnCreated(column) {
    set((state) => ({
      columns: [...state.columns, { ...column, cards: [] }].sort((a, b) => a.position - b.position),
    }));
  },

  applyColumnUpdated(column) {
    set((state) => ({
      columns: state.columns
        .map(col => col.id === column.id ? { ...col, ...column } : col)
        .sort((a, b) => a.position - b.position),
    }));
  },

  applyColumnDeleted(columnId) {
    set((state) => ({
      columns: state.columns.filter(col => col.id !== columnId),
    }));
  },
}));
