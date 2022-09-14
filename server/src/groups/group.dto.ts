import { ApiProperty } from '@nestjs/swagger';

export class GetGroupResponse {
  @ApiProperty()
  name: string;

  @ApiProperty()
  groups: GetGroupResponse[];

  services: string[];
}

export class GetGroupsResponse {
  topLevelGropus: GetGroupResponse[];
}
