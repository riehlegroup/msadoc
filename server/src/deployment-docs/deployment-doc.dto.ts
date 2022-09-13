import { ApiProperty } from '@nestjs/swagger';

export class CreateDeploymentDocRequest {
  @ApiProperty()
  name: string;

  @ApiProperty()
  kubernetesUrl: string;

  @ApiProperty()
  kubernetesUser: string;

  @ApiProperty()
  kubernetesPassword: string;

  @ApiProperty()
  kubernetesLabels?: string[];
}

export class CreateDeploymentDocResponse extends CreateDeploymentDocRequest {
  @ApiProperty()
  creationTimestamp: Date;

  @ApiProperty()
  updateTimestamp: Date;
}

export class GetDeploymentDocResponse extends CreateDeploymentDocResponse {}
export class DeleteDeploymentDocResponse extends GetDeploymentDocResponse {}

export class ListDeploymentDocResponse {
  @ApiProperty()
  deploymentDocs: GetDeploymentDocResponse[];
}
