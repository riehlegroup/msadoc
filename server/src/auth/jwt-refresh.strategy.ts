import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtRefreshAuthGuardHandle } from './jwt-refresh.guard';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  JwtRefreshAuthGuardHandle,
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('msadoc_jwt_refresh_secret'),
    });
  }

  async validate(payload: any) {
    return { username: payload.username };
  }
}
