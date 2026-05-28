import { api } from '../client';
import type { BoardMember } from '../../types';

export const listMembers = (boardId: string) =>
  api.get<{ members: BoardMember[] }>(`/api/v1/boards/${boardId}/members`);

export const addMember = (boardId: string, data: { userId: string; role?: string }) =>
  api.post<BoardMember>(`/api/v1/boards/${boardId}/members`, data);

export const removeMember = (boardId: string, userId: string) =>
  api.delete<void>(`/api/v1/boards/${boardId}/members/${userId}`);
