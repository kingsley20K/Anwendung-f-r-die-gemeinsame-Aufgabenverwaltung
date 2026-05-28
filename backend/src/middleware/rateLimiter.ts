import rateLimit from 'express-rate-limit';

const errorBody = (code: string, message: string) => ({
  error: { code, message },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: errorBody('TOO_MANY_REQUESTS', 'Too many attempts, please try again in 15 minutes'),
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: errorBody('TOO_MANY_REQUESTS', 'Slow down'),
});

export const searchRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: errorBody('TOO_MANY_REQUESTS', 'Search rate limit exceeded'),
});
