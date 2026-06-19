import type { NeonDatabase } from 'drizzle-orm/neon-serverless';

import type * as schema from './schemas';

export type FiDatabaseSchema = typeof schema;

export type FiDatabase = NeonDatabase<FiDatabaseSchema>;

export type Transaction = Parameters<Parameters<FiDatabase['transaction']>[0]>[0];
