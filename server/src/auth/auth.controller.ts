import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
  Request,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import {
  CreateApiKeyRequestDto,
  CreateApiKeyResponseDto,
  GetApiKeyResponseDto,
  GetApiKeysResponseDto,
} from './api-keys.dto';
import {
  LoginRequestDto,
  LoginResponseDto,
  RefreshTokenRequestDto,
} from './auth.dto';
import { AuthService } from './auth.service';
import { JwtAccessAuthGuard } from './jwt-access.guard';
import { JwtRefreshAuthGuard } from './jwt-refresh.guard';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private apiKeysService: ApiKeysService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginRequestDto): Promise<LoginResponseDto> {
    return await this.authService.generateTokens(body.username);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @ApiBearerAuth()
  @Post('refresh')
  @HttpCode(200)
  async refreshToken(
    @Body() body: RefreshTokenRequestDto,
  ): Promise<LoginResponseDto> {
    return await this.authService.refreshTokens(body.refresh_token);
  }

  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  getMyProfile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth()
  @Get('api-keys')
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
  @Post('api-keys')
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
  @Delete('api-keys/:keyName')
  @HttpCode(200)
  deleteApiKey(@Param() params: { keyName: string }): void {
    return this.apiKeysService.delete(params.keyName);
  }
}
