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
import { ApiParam, ApiSecurity } from '@nestjs/swagger';
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
  @ApiSecurity('jwt')
  @Get('/')
  @HttpCode(200)
  async getAllApiKeys(): Promise<GetApiKeysResponseDto> {
    return {
      apiKeys: (await this.apiKeysService.getAll()).map(
        (model): GetApiKeyResponseDto => {
          return {
            id: model.id,
            keyName: model.keyName,
            creationTimestamp: model.creationTimestamp,
          };
        },
      ),
    };
  }

  @UseGuards(JwtAccessAuthGuard)
  @ApiSecurity('jwt')
  @Post('/')
  @HttpCode(201)
  async createApiKey(
    @Body() createApiKeyDto: CreateApiKeyRequestDto,
  ): Promise<CreateApiKeyResponseDto> {
    return await this.apiKeysService.create(createApiKeyDto.keyName);
  }

  @UseGuards(JwtAccessAuthGuard)
  @ApiSecurity('jwt')
  @Delete('/')
  @HttpCode(200)
  async deleteAllApiKeys(): Promise<void> {
    return await this.apiKeysService.deleteAll();
  }

  @UseGuards(JwtAccessAuthGuard)
  @ApiSecurity('jwt')
  @Delete('/:keyId')
  @ApiParam({
    name: 'keyId',
    description: 'Id of the api-key to be deleted',
  })
  @HttpCode(200)
  async deleteApiKey(@Param() params: { keyId: number }): Promise<void> {
    return await this.apiKeysService.delete(params.keyId);
  }

  @UseGuards(ApiKeyAuthGuard)
  @ApiSecurity('api-key')
  @Get('/test')
  @HttpCode(200)
  testApiKey(): IsApiKeyValidResponseDto {
    return {
      isApiKeyValid: true,
    };
  }
}
