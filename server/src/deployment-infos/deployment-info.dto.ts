import { ApiProperty } from '@nestjs/swagger';

export class GetDeploymentInfoResponse {
  @ApiProperty()
  pods: PodInfoResponse[];

  @ApiProperty()
  services: string[];

  @ApiProperty()
  deployments: string[];

  @ApiProperty()
  endponts: string[];
}

export class PodInfoResponse {
  @ApiProperty()
  namespace?: string;

  @ApiProperty()
  name?: string;

  @ApiProperty()
  status?: string;

  @ApiProperty()
  ready?: string;

  @ApiProperty()
  age?: string;
}

export type GetAllDeploymentInfoResponse = Record<
  string,
  GetDeploymentInfoResponse
>;
