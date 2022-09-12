import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  /**
   * Used by NestJS to reach database.
   * Keep in sync with @see TypeOrm.config.ts
   */
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.getOrThrow('msadoc_db_host'),
      port: +this.configService.getOrThrow('msadoc_db_port'),
      username: this.configService.getOrThrow('msadoc_db_user'),
      password: this.configService.getOrThrow('msadoc_db_pw'),
      database: this.configService.getOrThrow('msadoc_db_db'),
      autoLoadEntities: true,
      migrationsTableName: 'migrations',
      migrationsRun: true,
      migrations: [join(__dirname, '**', '/migrations/*.{ts,js}')],
    };
  }
}
