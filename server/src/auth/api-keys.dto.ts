import { ApiProperty } from '@nestjs/swagger';

export class CreateApiKeyRequestDto {
  @ApiProperty()
  keyName: string;
}

export class CreateApiKeyResponseDto {
  @ApiProperty()
  keyName: string;

  @ApiProperty()
  apiKey: string;
}

export class GetApiKeyResponseDto {
  @ApiProperty()
  keyName: string;
}

export class GetApiKeysResponseDto {
  @ApiProperty()
  apiKeys: GetApiKeyResponseDto[];
}
