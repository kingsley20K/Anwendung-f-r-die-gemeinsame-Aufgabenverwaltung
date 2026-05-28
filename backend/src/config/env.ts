import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { z } from 'zod';

// In a monorepo, the .env lives at the project root (parent of backend/).
// In Docker, env vars are injected directly and no file is needed.
const envPath = existsSync('.env') ? '.env' : resolve(process.cwd(), '../.env');
dotenv.config({ path: envPath });

const envSchema = z.object({
  NODE_ENV:                z.enum(['development', 'production', 'test']).default('development'),
  PORT:                    z.coerce.number().default(3000),
  SUPABASE_URL:            z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY:       z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  FRONTEND_URL:            z.string().url().default('http://localhost:5173'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment variables:');
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = result.data;
