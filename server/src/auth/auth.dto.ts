import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;
}

export class LoginResponseDto {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  refresh_token: string;
}

export class RefreshTokenRequestDto {
  @ApiProperty()
  refresh_token: string;
}
