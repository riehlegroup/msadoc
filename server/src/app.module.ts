import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './TypeOrmConfigService';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.dev.local'],
    }),
    AuthModule,
    UsersModule,
    ApiKeysModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
    }),
  ],
  exports: [ConfigModule],
  controllers: [AppController],
  providers: [AppService, TypeOrmConfigService],
})
export class AppModule {}
