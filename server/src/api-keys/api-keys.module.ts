import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyOrm } from './api-key.orm';
import { ApiKeyStrategy } from './api-key.strategy';
import { ApiKeysController, ApiKeyTestController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKeyOrm])],
  controllers: [ApiKeysController, ApiKeyTestController],
  providers: [ApiKeysService, ApiKeyStrategy],
})
export class ApiKeysModule {}
