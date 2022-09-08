import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

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
  entities: ['src/**/*.orm.ts', 'src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
