import { api } from '../client';
import type { User } from '../../types';

interface AuthResponse {
  user: User;
  accessToken: string;
}

export const register = (data: { email: string; password: string; displayName: string }) =>
  api.post<AuthResponse>('/api/v1/auth/register', data);

export const login = (data: { email: string; password: string }) =>
  api.post<AuthResponse>('/api/v1/auth/login', data);

export const logout = () =>
  api.post<void>('/api/v1/auth/logout');

export const getMe = () =>
  api.get<User>('/api/v1/users/me');

export const updateMe = (data: { displayName?: string }) =>
  api.patch<User>('/api/v1/users/me', data);

export const searchUserByEmail = (email: string) =>
  api.get<{ id: string; displayName: string }>(`/api/v1/users?email=${encodeURIComponent(email)}`);

export const listAllUsers = () =>
  api.get<{ users: Array<{ id: string; displayName: string; email: string }> }>('/api/v1/users');
