import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.getOrThrow('db_host'),
      port: +this.configService.getOrThrow('db_port'),
      username: this.configService.getOrThrow('db_user'),
      password: this.configService.getOrThrow('db_pw'),
      database: this.configService.getOrThrow('db_db'),
      entities: [],
      synchronize: true,
    };
  }
}
