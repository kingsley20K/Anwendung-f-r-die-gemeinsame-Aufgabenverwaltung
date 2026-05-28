import type { AxiosError } from 'axios';

interface ErrorPayload {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isUnauthorized()  { return this.status === 401; }
  get isForbidden()     { return this.status === 403; }
  get isNotFound()      { return this.status === 404; }
  get isConflict()      { return this.status === 409; }
  get isServerError()   { return this.status >= 500; }
  get isTokenExpired()  { return this.code === 'TOKEN_EXPIRED'; }

  static from(error: AxiosError): ApiError {
    const status  = error.response?.status ?? 0;
    const data    = error.response?.data as ErrorPayload | undefined;
    const payload = data?.error;
    const code    = payload?.code    ?? 'UNKNOWN_ERROR';
    const message = payload?.message ?? error.message ?? 'An unexpected error occurred';
    const details = payload?.details;
    return new ApiError(status, code, message, details);
  }
}
