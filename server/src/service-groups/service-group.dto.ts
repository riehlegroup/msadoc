import { ApiProperty } from '@nestjs/swagger';

export class GetServiceGroupResponse {
  @ApiProperty()
  name: string;

  @ApiProperty()
  groups: GetServiceGroupResponse[];

  services: string[];
}

export class GetServiceGroupsResponse {
  topLevelGropus: GetServiceGroupResponse[];
}
