import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  LoginRequestDto,
  LoginResponseDto,
  RefreshTokenRequestDto,
} from './auth.dto';
import { AuthService } from './auth.service';
import { JwtAccessAuthGuard } from './jwt-access.guard';
import { JwtRefreshAuthGuard } from './jwt-refresh.guard';
import { UserPasswordAuthGuard } from './user-password.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(UserPasswordAuthGuard)
  @Post('login')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Successfully signed in.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Invalid credentials.',
  })
  async login(@Body() body: LoginRequestDto): Promise<LoginResponseDto> {
    return await this.authService.generateTokens(body.username);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @ApiSecurity('jwt-refresh')
  @Post('refresh')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Successfully refreshed the access_token.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Login to get access_token.',
  })
  async refreshToken(
    @Body() body: RefreshTokenRequestDto,
  ): Promise<LoginResponseDto> {
    return await this.authService.refreshTokens(body.refresh_token);
  }

  @UseGuards(JwtAccessAuthGuard)
  @ApiSecurity('jwt')
  @Get('me')
  @ApiResponse({
    status: 200,
    description: 'Fetched the profile of the signed-in user.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Login to get access_token.',
  })
  getMyProfile(@Request() req: any) {
    return req.user;
  }
}
