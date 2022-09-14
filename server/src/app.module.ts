import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { TypeOrmConfigService } from './database/db-config.service';
import { DatabaseModule } from './database/database.module';
import { ServiceDocsModule } from './service-docs/service-docs.module';
import { ServiceGroupsModule } from './service-groups/service-groups.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
    }),
    AuthModule,
    UsersModule,
    ApiKeysModule,
    DatabaseModule,
    ServiceDocsModule,
    ServiceGroupsModule,
  ],
  exports: [ConfigModule],
  controllers: [AppController],
  providers: [AppService, TypeOrmConfigService],
})
export class AppModule {}
