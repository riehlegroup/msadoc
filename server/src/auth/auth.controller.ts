import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
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
  constructor(private authService: AuthService) {}

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
}
