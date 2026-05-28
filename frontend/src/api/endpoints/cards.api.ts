import { api } from '../client';
import type { Card } from '../../types';

export const createCard = (boardId: string, columnId: string, data: { title: string; description?: string }) =>
  api.post<Card>(`/api/v1/boards/${boardId}/columns/${columnId}/cards`, data);

export const moveCard = (boardId: string, cardId: string, data: { columnId: string; position: number }) =>
  api.patch<Card>(`/api/v1/boards/${boardId}/cards/${cardId}`, data);

export const updateCard = (boardId: string, cardId: string, data: { title?: string; description?: string }) =>
  api.patch<Card>(`/api/v1/boards/${boardId}/cards/${cardId}`, data);

export const deleteCard = (boardId: string, cardId: string) =>
  api.delete<void>(`/api/v1/boards/${boardId}/cards/${cardId}`);
