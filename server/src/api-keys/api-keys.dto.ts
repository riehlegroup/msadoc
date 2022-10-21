import { ApiProperty } from '@nestjs/swagger';
import { IsNonEmptyString } from '../utils/class-validators';

export class CreateApiKeyRequestDto {
  @ApiProperty()
  @IsNonEmptyString()
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
