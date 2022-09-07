import { Module } from '@nestjs/common';
import { ApiKeyStrategy } from './api-key.strategy';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';

@Module({
  controllers: [ApiKeysController],
  providers: [ApiKeysService, ApiKeyStrategy],
})
export class ApiKeysModule {}
