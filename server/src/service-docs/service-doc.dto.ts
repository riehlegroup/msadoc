import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDocRequest {
  @ApiProperty()
  name: string;

  @ApiProperty()
  tags?: string[];

  @ApiProperty()
  repository?: string;

  @ApiProperty()
  taskBoard?: string;

  /** Dependencies */

  @ApiProperty()
  consumedAPIs?: string[];

  @ApiProperty()
  providedAPIs?: string[];

  @ApiProperty()
  producedEvents?: string[];

  @ApiProperty()
  consumedEvents?: string[];

  /** Documentation links */

  @ApiProperty()
  developmentDocumentation?: string;

  @ApiProperty()
  deploymentDocumentation?: string;

  @ApiProperty()
  apiDocumentation?: string;

  /** Responsibilities */

  @ApiProperty()
  responsibleTeam?: string;

  @ApiProperty()
  responsibles?: string[];

  /** Deployment */
  @ApiProperty()
  kubernetesLabels?: string[];
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
  @ApiProperty()
  serviceDocs: GetServiceDocResponse[];
}
