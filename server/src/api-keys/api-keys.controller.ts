import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAccessAuthGuard } from '../auth/jwt-access.guard';
import { ApiKeyAuthGuard } from './api-key.guard';
import {
  GetApiKeysResponseDto,
  GetApiKeyResponseDto,
  CreateApiKeyRequestDto,
  CreateApiKeyResponseDto,
  IsApiKeyValidResponseDto,
} from './api-keys.dto';
import { ApiKeysService } from './api-keys.service';

@Controller('api-keys')
export class ApiKeysController {
  constructor(private apiKeysService: ApiKeysService) {}

  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  @Get('/')
  @HttpCode(200)
  getAllApiKeys(): GetApiKeysResponseDto {
    return {
      apiKeys: this.apiKeysService
        .getAllKeyNames()
        .map((keyName): GetApiKeyResponseDto => {
          return {
            keyName: keyName,
          };
        }),
    };
  }

  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  @Post('/')
  @HttpCode(200)
  createApiKey(
    @Body() createApiKeyDto: CreateApiKeyRequestDto,
  ): CreateApiKeyResponseDto {
    return {
      keyName: createApiKeyDto.keyName,
      apiKey: this.apiKeysService.create(createApiKeyDto.keyName),
    };
  }

  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  @Delete('/:keyName')
  @HttpCode(200)
  deleteApiKey(@Param() params: { keyName: string }): void {
    return this.apiKeysService.delete(params.keyName);
  }

  @UseGuards(ApiKeyAuthGuard)
  @ApiBearerAuth()
  @Get('/test')
  @HttpCode(200)
  testApiKey(): IsApiKeyValidResponseDto {
    return {
      isApiKeyValid: true,
    };
  }
}
