import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import {
  LoginRequestDto,
  LoginResponseDto,
  RefreshTokenRequestDto,
} from './auth.dto';
import { AuthService } from './auth.service';
import { JwtAccessAuthGuard } from './jwt-access.guard';
import { JwtRefreshAuthGuard } from './jwt-refresh.guard';
import { UserPasswordAuthGuard } from './user-password.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(UserPasswordAuthGuard)
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginRequestDto): Promise<LoginResponseDto> {
    return await this.authService.generateTokens(body.username);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @ApiSecurity('jwt-refresh')
  @Post('refresh')
  @HttpCode(200)
  async refreshToken(
    @Body() body: RefreshTokenRequestDto,
  ): Promise<LoginResponseDto> {
    return await this.authService.refreshTokens(body.refresh_token);
  }

  @UseGuards(JwtAccessAuthGuard)
  @ApiSecurity('jwt')
  @Get('me')
  getMyProfile(@Request() req: any) {
    return req.user;
  }
}
