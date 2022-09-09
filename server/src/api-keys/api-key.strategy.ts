import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { Request } from 'express';
import { ApiKeyAuthGuardHandle } from './api-key.guard';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  Strategy,
  ApiKeyAuthGuardHandle,
) {
  constructor(private apiKeyService: ApiKeysService) {
    super();
  }

  async validate(request: Request): Promise<true> {
    const apiKeyHeader = request.headers.authorization;
    if (!(typeof apiKeyHeader === 'string')) {
      throw new UnauthorizedException(
        'Authorization header not correctly formatted as string.',
      );
    }
    if (
      !apiKeyHeader.startsWith('Bearer ') &&
      !apiKeyHeader.startsWith('bearer ')
    ) {
      throw new UnauthorizedException(
        'Authorization header not correctly formatted as bearer auth.',
      );
    }
    const apiKey = apiKeyHeader.substring(7, apiKeyHeader.length);
    const isApiKeyValid = await this.apiKeyService.check(apiKey);
    if (!isApiKeyValid) {
      throw new UnauthorizedException({
        isApiKeyValid: false,
      });
    }
    return true; // Framework requires some return indicating success
  }
}
