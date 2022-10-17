import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateApiKeyRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  keyName: string;
}

export class GetApiKeyResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  keyName: string;

  @ApiProperty()
  creationTimestamp: Date;
}

export class CreateApiKeyResponseDto extends GetApiKeyResponseDto {
  @ApiProperty()
  apiKey: string;
}

export class GetApiKeysResponseDto {
  @ApiProperty()
  apiKeys: GetApiKeyResponseDto[];
}

export class IsApiKeyValidResponseDto {
  @ApiProperty()
  isApiKeyValid: boolean;
}
