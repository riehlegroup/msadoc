import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class UserPasswordStrategy extends PassportStrategy(Strategy, 'local') {
  private readonly logger = new Logger(UserPasswordStrategy.name);

  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (user === undefined) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
