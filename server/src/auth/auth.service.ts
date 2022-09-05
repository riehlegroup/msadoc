import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Validates if a user can sign in.
   * @param username The user's username.
   * @param password The user's password.
   * @returns The user information on success, undefined on failure.
   */
  async validateUser(
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'> | undefined> {
    const user = await this.usersService.findOne(username);
    if (user !== undefined && user.password === password) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return undefined;
  }

  /**
   * Generate a pair of tokens for a signed-in user.
   * **Note:** Make sure the user is authenticated before generating a token for them!
   * @param username The username
   * @returns The token pair (access_token and refresh_token)
   */
  async generateTokens(username: string): Promise<AuthTokens> {
    const jwtPayload = {
      username: username,
      sub: username,
    };
    return {
      access_token: await this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.getOrThrow('jwt_access_secret'),
        expiresIn: '15m',
      }),
      refresh_token: await this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.getOrThrow('jwt_refresh_secret'),
        expiresIn: '30d',
      }),
    };
  }

  /**
   * Generate a pair of tokens for a signed-in user.
   * @param refresh_token A valid refresh token.
   * @returns A new token pair (access_token and refresh_token)
   */
  async refreshTokens(refresh_token: string): Promise<AuthTokens> {
    let refreshTokenValidation;
    try {
      refreshTokenValidation = await this.jwtService.verifyAsync(
        refresh_token,
        {
          secret: this.configService.getOrThrow('jwt_refresh_secret'),
        },
      );
    } catch (err) {
      throw new BadRequestException(err.message);
    }
    if (!refreshTokenValidation && !refreshTokenValidation.username) {
      throw new ForbiddenException('Refresh token not valid');
    }
    return await this.generateTokens(refreshTokenValidation.username);
  }
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}
