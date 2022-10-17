import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateServiceDocRequest {
  @ApiProperty({
    description: 'Name of the service. Used as identifier.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description:
      'Name of the group. Used as identifier to match with group meta-data. Hierarchical groups separated by a dot, e.g. "group.sub-group.sub-sub-group"',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  group?: string;

  @ApiProperty({
    description: 'List of tags used to filter.',
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'URL to code repository.',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  repository?: string;

  @ApiProperty({
    description: 'URL to task board.',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  taskBoard?: string;

  /** Dependencies */

  @ApiProperty({
    description:
      'List of consumed API identifiers. API identifier matched for dependency analysis.',
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  consumedAPIs?: string[];

  @ApiProperty({
    description:
      'List of provided API identifiers. API identifier matched for dependency analysis.',
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  providedAPIs?: string[];

  @ApiProperty({
    description:
      'List of produced event identifiers. Event identifier matched for dependency analysis.',
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  producedEvents?: string[];

  @ApiProperty({
    description:
      'List of consumed event identifiers. Event identifier matched for dependency analysis.',
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  consumedEvents?: string[];

  /** Documentation links */

  @ApiProperty({
    description: 'URL to development documentation.',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  developmentDocumentation?: string;

  @ApiProperty({
    description: 'URL to deployment documentation.',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  deploymentDocumentation?: string;

  @ApiProperty({
    description: 'URL to API documentation.',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  apiDocumentation?: string;

  /** Responsibilities */

  @ApiProperty({
    description:
      'Responsible team identifier. Used for matching multiple services to teams',
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  responsibleTeam?: string;

  @ApiProperty({
    description: 'List of responsible person identifiers.',
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
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
