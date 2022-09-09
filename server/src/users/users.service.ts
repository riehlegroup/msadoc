import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface User {
  username: string;
  password: string;
}

@Injectable()
export class UsersService {
  private readonly users: User[] = [];
  // TODO: don't save password as plain text

  constructor(private configService: ConfigService) {
    this.addDefaultUser();
  }

  private addDefaultUser() {
    this.users.push({
      username: this.configService.get<string>('user_name', 'admin'),
      password: this.configService.get<string>('user_password', 'password'),
    });
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }
}
