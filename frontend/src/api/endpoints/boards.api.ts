import { api } from '../client';
import type { Board } from '../../types';

export const getBoardById = (boardId: string) =>
  api.get<Board>(`/api/v1/boards/${boardId}`);

export const getBoards = () =>
  api.get<{ boards: Board[] }>('/api/v1/boards');

export const createBoard = (data: { title: string; description?: string }) =>
  api.post<Board>('/api/v1/boards', data);

export const updateBoard = (boardId: string, data: { title?: string; description?: string }) =>
  api.patch<Board>(`/api/v1/boards/${boardId}`, data);

export const deleteBoard = (boardId: string) =>
  api.delete<void>(`/api/v1/boards/${boardId}`);
