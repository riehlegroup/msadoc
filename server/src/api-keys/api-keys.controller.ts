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
import { ApiParam, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
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
@ApiTags('api-keys')
@UseGuards(JwtAccessAuthGuard)
@ApiSecurity('jwt')
@ApiResponse({
  status: 401,
  description: 'Unauthorized. Login to get access_token.',
})
export class ApiKeysController {
  constructor(private apiKeysService: ApiKeysService) {}

  @Get('/')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Fetched all existing API keys (without the secret).',
  })
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

  @Post('/')
  @HttpCode(201)
  @ApiResponse({
    status: 201,
    description: 'Created and returned an API key (with the secret).',
  })
  async createApiKey(
    @Body() createApiKeyDto: CreateApiKeyRequestDto,
  ): Promise<CreateApiKeyResponseDto> {
    return await this.apiKeysService.create(createApiKeyDto.keyName);
  }

  @Delete('/')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Deleted all API keys.',
  })
  async deleteAllApiKeys(): Promise<void> {
    return await this.apiKeysService.deleteAll();
  }

  @Delete('/:keyId')
  @ApiParam({
    name: 'keyId',
    description: 'Id of the api-key to be deleted',
  })
  @HttpCode(200)
  @ApiParam({
    name: 'keyId',
    description: 'ID of the api key to be deleted',
  })
  @ApiResponse({
    status: 200,
    description: 'Deleted an API key by id.',
  })
  async deleteApiKey(@Param() params: { keyId: number }): Promise<void> {
    return await this.apiKeysService.delete(params.keyId);
  }
}

@Controller('api-keys')
@ApiTags('api-keys')
@ApiSecurity('api-key')
@UseGuards(ApiKeyAuthGuard)
@ApiResponse({
  status: 401,
  description: 'Unauthorized. Create api-key to access this API.',
})
export class ApiKeyTestController {
  @Get('/test')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Successfully tested that provided API key is valid.',
  })
  testApiKey(): IsApiKeyValidResponseDto {
    return {
      isApiKeyValid: true,
    };
  }
}
