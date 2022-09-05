import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

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

  async login(username: string): Promise<{ access_token: string }> {
    const jwtPayload = {
      username: username,
      sub: username,
    };
    return {
      access_token: this.jwtService.sign(jwtPayload),
    };
  }
}
