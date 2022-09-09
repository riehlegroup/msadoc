import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceDocRequest {
  @ApiProperty()
  name: string;

  @ApiProperty()
  consumedAPIs?: string[];

  @ApiProperty()
  providedAPIs?: string[];

  @ApiProperty()
  producedEvents?: string[];

  @ApiProperty()
  consumedEvents?: string[];

  @ApiProperty()
  repository?: string;

  @ApiProperty()
  taskBoard?: string;

  @ApiProperty()
  developmentDocumentation?: string;

  @ApiProperty()
  deploymentDocumentation?: string;

  @ApiProperty()
  apiDocumentation?: string;

  @ApiProperty()
  responsibleTeam?: string;

  @ApiProperty()
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
  @ApiProperty()
  serviceDocs: GetServiceDocResponse[];
}
