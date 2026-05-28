import { api } from '../client';
import type { Column } from '../../types';

export const createColumn = (boardId: string, data: { title: string }) =>
  api.post<Column>(`/api/v1/boards/${boardId}/columns`, data);

export const updateColumn = (boardId: string, columnId: string, data: { title?: string; position?: number }) =>
  api.patch<Column>(`/api/v1/boards/${boardId}/columns/${columnId}`, data);

export const deleteColumn = (boardId: string, columnId: string) =>
  api.delete<void>(`/api/v1/boards/${boardId}/columns/${columnId}`);
