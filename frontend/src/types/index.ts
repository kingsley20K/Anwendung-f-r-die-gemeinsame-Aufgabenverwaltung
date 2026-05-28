export interface User {
  id: string;
  email: string;
  displayName: string;
}

export interface Card {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  position: number;
  createdAt: string;
  createdBy?: { id: string; displayName: string };
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  position: number;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  description: string | null;
  owner: { id: string; displayName: string };
  columns: Column[];
}

export interface BoardMember {
  id: string;
  displayName: string;
  role: 'owner' | 'member';
  joinedAt: string;
}
