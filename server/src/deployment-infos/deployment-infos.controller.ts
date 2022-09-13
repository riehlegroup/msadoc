import { Controller, Get, HttpCode, Param, UseGuards } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { DeploymentDocsService } from '../deployment-docs/deployment-docs.service';
import { JwtAccessAuthGuard } from '../auth/jwt-access.guard';
import { GetDeploymentInfoResponse } from './deployment-info.dto';
import { DeploymentInfosService } from './deployment-infos.service';

@Controller('deployment-infos')
export class DeploymentInfosController {
  constructor(
    private deploymentDocsService: DeploymentDocsService,
    private deploymentInfosService: DeploymentInfosService,
  ) {}

  @UseGuards(JwtAccessAuthGuard)
  @ApiSecurity('jwt')
  @Get('/deployment/:deploymentName')
  @HttpCode(200)
  async getDeploymentInfo(
    @Param('deploymentName') deploymentName: string,
  ): Promise<GetDeploymentInfoResponse> {
    const deploymentDoc = await this.deploymentDocsService.getByName(
      deploymentName,
    );
    return this.deploymentInfosService.getDeploymentInfo(deploymentDoc);
  }
}
