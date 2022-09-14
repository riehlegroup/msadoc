import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDocRequest {
  @ApiProperty({
    description: 'Name of the service. Used as identifier.',
  })
  name: string;

  @ApiProperty({
    description:
      'Name of the group. Used as identifier to match with group meta-data. Hierarchical groups separated by a dot, e.g. "group.sub-group.sub-sub-group"',
  })
  group?: string;

  @ApiProperty({
    description: 'List of tags used to filter.',
  })
  tags?: string[];

  @ApiProperty({
    description: 'URL to code repository.',
  })
  repository?: string;

  @ApiProperty({
    description: 'URL to task board.',
  })
  taskBoard?: string;

  /** Dependencies */

  @ApiProperty({
    description:
      'List of consumed API identifiers. API identifier matched for dependency analysis.',
  })
  consumedAPIs?: string[];

  @ApiProperty({
    description:
      'List of provided API identifiers. API identifier matched for dependency analysis.',
  })
  providedAPIs?: string[];

  @ApiProperty({
    description:
      'List of produced event identifiers. Event identifier matched for dependency analysis.',
  })
  producedEvents?: string[];

  @ApiProperty({
    description:
      'List of consumed event identifiers. Event identifier matched for dependency analysis.',
  })
  consumedEvents?: string[];

  /** Documentation links */

  @ApiProperty({
    description: 'URL to development documentation.',
  })
  developmentDocumentation?: string;

  @ApiProperty({
    description: 'URL to deployment documentation.',
  })
  deploymentDocumentation?: string;

  @ApiProperty({
    description: 'URL to API documentation.',
  })
  apiDocumentation?: string;

  /** Responsibilities */

  @ApiProperty({
    description:
      'Responsible team identifier. Used for matching multiple services to teams',
  })
  responsibleTeam?: string;

  @ApiProperty({
    description: 'List of responsible person identifiers.',
  })
  responsibles?: string[];
}

export class CreateServiceDocResponse extends CreateServiceDocRequest {
  @ApiProperty()
  creationTimestamp: Date;

  @ApiProperty()
  updateTimestamp: Date;
}

export class GetServiceDocResponse extends CreateServiceDocResponse {}
export class DeleteServiceDocResponse extends GetServiceDocResponse {}

export class ListServiceDocResponse {
  @ApiProperty({
    type: [GetServiceDocResponse],
  })
  serviceDocs: GetServiceDocResponse[];
}
