import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';

config();

const configService = new ConfigService();

/**
 * Used for generating and managing database migrations via TypeORM
 * Keep in sync with @see TypeOrmConfig.service.ts
 */
export default new DataSource({
  type: 'postgres',
  host: configService.getOrThrow('db_host'),
  port: +configService.getOrThrow('db_port'),
  username: configService.getOrThrow('db_user'),
  password: configService.getOrThrow('db_pw'),
  database: configService.getOrThrow('db_db'),
  entities: [
    join(__dirname, '**', '*.orm.{ts,js}'),
    join(__dirname, '**', '*.entity.{ts,js}'),
  ],
  migrations: [join(__dirname, '**', '/migrations/*.{ts,js}')],
  migrationsTableName: 'migrations',
});
