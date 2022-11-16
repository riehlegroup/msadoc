import { Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

@Injectable()
export class E2eTypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor() {}

  /**
   * Used by NestJS to reach database.
   * Keep in sync with @see TypeOrm.config.ts
   */
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'sqlite',
      database: ':memory:',
      logging: true,

      autoLoadEntities: true,
      migrationsTableName: 'migrations',
      migrationsRun: true,
      migrations: [join(__dirname, '**', '/migrations/*.{ts,js}')],
    };
  }
}
