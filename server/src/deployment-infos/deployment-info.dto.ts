import { ApiProperty } from '@nestjs/swagger';

export class GetDeploymentInfoResponse {
  @ApiProperty()
  pods: string[];

  @ApiProperty()
  services: string[];

  @ApiProperty()
  deployments: string[];

  @ApiProperty()
  endponts: string[];
}
