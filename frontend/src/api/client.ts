import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from './tokenStore';
import { ApiError } from './ApiError';

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000') + '/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ── Silent-refresh state ──────────────────────────────────────────────────────
let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

function drainQueue(token: string) {
  pendingRequests.forEach((resolve) => resolve(token));
  pendingRequests = [];
}

function flushQueue() {
  pendingRequests = [];
}

// ── Request interceptor — inject access token ─────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor — silent refresh on 401 TOKEN_EXPIRED ────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const data = error.response?.data as { error?: { code?: string } } | undefined;

    const isTokenExpired =
      error.response?.status === 401 &&
      data?.error?.code === 'TOKEN_EXPIRED' &&
      !original._retry;

    if (!isTokenExpired) {
      return Promise.reject(ApiError.from(error));
    }

    if (isRefreshing) {
      return new Promise<string>((resolve) => {
        pendingRequests.push(resolve);
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<{ accessToken: string }>(
        `${BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );
      const newToken = data.accessToken;
      tokenStore.set(newToken);
      drainQueue(newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    } catch (refreshError) {
      flushQueue();
      tokenStore.clear();
      return Promise.reject(ApiError.from(refreshError as AxiosError));
    } finally {
      isRefreshing = false;
    }
  },
);

export const api = {
  get:    <T>(path: string, config?: object)              => apiClient.get<T>(path, config).then((r) => r.data),
  post:   <T>(path: string, body?: unknown, config?: object) => apiClient.post<T>(path, body, config).then((r) => r.data),
  patch:  <T>(path: string, body?: unknown, config?: object) => apiClient.patch<T>(path, body, config).then((r) => r.data),
  delete: <T>(path: string, config?: object)              => apiClient.delete<T>(path, config).then((r) => r.data),
};
