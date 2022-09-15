import { ApiProperty } from '@nestjs/swagger';

export class GetServiceGroupResponse {
  @ApiProperty({
    description: 'Name of the group.',
  })
  name: string;

  @ApiProperty({
    description: 'Sub-groups representing a hierarchy.',
    type: () => [GetServiceGroupResponse], // buggy, shows only string?!
  })
  groups: GetServiceGroupResponse[];

  @ApiProperty({
    description: 'List of service identifiers within the group',
  })
  services: string[];
}
