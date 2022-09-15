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
  host: configService.getOrThrow('msadoc_db_host'),
  port: +configService.getOrThrow('msadoc_db_port'),
  username: configService.getOrThrow('msadoc_db_user'),
  password: configService.getOrThrow('msadoc_db_pw'),
  database: configService.getOrThrow('msadoc_db_db'),
  entities: [
    join('src', '**', '*.orm.{ts,js}'),
    join('src', '**', '*.entity.{ts,js}'),
  ],
  migrations: [join('src', 'database', 'migrations', '*.{ts,js}')],
  migrationsTableName: 'migrations',
});
