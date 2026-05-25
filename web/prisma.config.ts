import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local for CLI commands (Next.js handles this at runtime automatically)
config({ path: resolve(__dirname, '.env.local') });
config({ path: resolve(__dirname, '../.env') }); // fallback to root .env

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
