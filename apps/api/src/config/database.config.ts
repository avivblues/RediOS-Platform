import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  uri: string;
}

export const databaseConfig = registerAs<DatabaseConfig>('database', () => ({
  uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/redios',
}));
