import {
  Controller,
  Get,
  HttpCode,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiQuery, ApiSecurity } from '@nestjs/swagger';
import { DeploymentDocsService } from '../deployment-docs/deployment-docs.service';
import { JwtAccessAuthGuard } from '../auth/jwt-access.guard';
import { GetDeploymentInfoResponse } from './deployment-info.dto';
import { DeploymentInfosService } from './deployment-infos.service';
import { ServiceDocsService } from '../service-docs/service-docs.service';

@Controller('deployment-infos')
export class DeploymentInfosController {
  constructor(
    private deploymentDocsService: DeploymentDocsService,
    private deploymentInfosService: DeploymentInfosService,
    private serviceDocsService: ServiceDocsService,
  ) {}

  @UseGuards(JwtAccessAuthGuard)
  @ApiSecurity('jwt')
  @ApiQuery({
    name: 'service',
    description: 'Service name to filter for',
    required: false,
  })
  @Get('/deployment/:deploymentName')
  @HttpCode(200)
  async getDeploymentInfoForDeployment(
    @Param('deploymentName') deploymentName: string,
    @Query('service') serviceName?: string,
  ): Promise<GetDeploymentInfoResponse> {
    const deploymentDoc = await this.deploymentDocsService.getByName(
      deploymentName,
    );
    if (serviceName === undefined) {
      return this.deploymentInfosService.getDeploymentInfo(deploymentDoc);
    }

    const serviceDoc = await this.serviceDocsService.getByName(serviceName);
    return this.deploymentInfosService.getDeploymentInfo(
      deploymentDoc,
      serviceDoc.kubernetesLabels,
    );
  }
}
