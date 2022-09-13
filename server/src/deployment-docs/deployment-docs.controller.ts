import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import {
  CreateDeploymentDocRequest,
  CreateDeploymentDocResponse,
  DeleteDeploymentDocResponse,
  GetDeploymentDocResponse,
  ListDeploymentDocResponse,
} from './deployment-doc.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiSecurity } from '@nestjs/swagger';
import { ApiKeyAuthGuardHandle } from '../api-keys/api-key.guard';
import {
  JwtAccessAuthGuardHandle,
  JwtAccessAuthGuard,
} from '../auth/jwt-access.guard';
import { DeploymentDocsService } from './deployment-docs.service';

@Controller('deployment-docs')
export class DeploymentDocsController {
  constructor(private readonly deploymentDocsService: DeploymentDocsService) {}

  @UseGuards(AuthGuard([JwtAccessAuthGuardHandle, ApiKeyAuthGuardHandle]))
  @ApiSecurity('jwt')
  @ApiSecurity('api-key')
  @Post('/')
  @HttpCode(201)
  async createDeploymentDoc(
    @Body() createDto: CreateDeploymentDocRequest,
  ): Promise<CreateDeploymentDocResponse> {
    return await this.deploymentDocsService.create(createDto);
  }

  @UseGuards(JwtAccessAuthGuard)
  @ApiSecurity('jwt')
  @Get('/')
  @HttpCode(200)
  async listAllDeploymentDocs(): Promise<ListDeploymentDocResponse> {
    return {
      deploymentDocs: await this.deploymentDocsService.getAll(),
    };
  }

  @UseGuards(JwtAccessAuthGuard)
  @ApiSecurity('jwt')
  @Get('/:deploymentName')
  @HttpCode(200)
  async getDeploymentDocByName(
    @Param('deploymentName') deploymentName: string,
  ): Promise<GetDeploymentDocResponse> {
    return await this.deploymentDocsService.getByName(deploymentName);
  }

  @UseGuards(JwtAccessAuthGuard)
  @ApiSecurity('jwt')
  @Delete('/')
  @HttpCode(200)
  async deleteAllDeploymentDocs(): Promise<void> {
    await this.deploymentDocsService.deleteAll();
  }

  @UseGuards(JwtAccessAuthGuard)
  @ApiSecurity('jwt')
  @Delete('/:deploymentName')
  @HttpCode(200)
  async deleteDeploymentDocByName(
    @Param('deploymentName') deploymentName: string,
  ): Promise<DeleteDeploymentDocResponse> {
    return await this.deploymentDocsService.delete(deploymentName);
  }
}
