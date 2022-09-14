import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuardHandle } from '../api-keys/api-key.guard';
import {
  JwtAccessAuthGuard,
  JwtAccessAuthGuardHandle,
} from '../auth/jwt-access.guard';
import {
  CreateServiceDocRequest,
  CreateServiceDocResponse,
  DeleteServiceDocResponse,
  GetServiceDocResponse,
  ListServiceDocResponse,
} from './service-doc.dto';
import { ServiceDocsService } from './service-docs.service';

@ApiTags('service-docs')
@Controller('service-docs')
export class ServiceDocsController {
  constructor(private serviceDocsService: ServiceDocsService) {}

  @UseGuards(AuthGuard([JwtAccessAuthGuardHandle, ApiKeyAuthGuardHandle]))
  @ApiSecurity('jwt')
  @ApiSecurity('api-key')
  @Post('/')
  @HttpCode(201)
  async createServiceDoc(
    @Body() createDto: CreateServiceDocRequest,
  ): Promise<CreateServiceDocResponse> {
    return await this.serviceDocsService.create(createDto);
  }

  @UseGuards(JwtAccessAuthGuard)
  @ApiSecurity('jwt')
  @Get('/')
  @HttpCode(200)
  async listAllServiceDocs(): Promise<ListServiceDocResponse> {
    return {
      serviceDocs: await this.serviceDocsService.getAll(),
    };
  }

  @UseGuards(JwtAccessAuthGuard)
  @ApiSecurity('jwt')
  @Get('/:serviceName')
  @HttpCode(200)
  async getServiceDocByName(
    @Param('serviceName') serviceName: string,
  ): Promise<GetServiceDocResponse> {
    return await this.serviceDocsService.getByName(serviceName);
  }

  @UseGuards(JwtAccessAuthGuard)
  @ApiSecurity('jwt')
  @Delete('/')
  @HttpCode(200)
  async deleteAllServiceDocs(): Promise<void> {
    await this.serviceDocsService.deleteAll();
  }

  @UseGuards(JwtAccessAuthGuard)
  @ApiSecurity('jwt')
  @Delete('/:serviceName')
  @HttpCode(200)
  async deleteServiceDocByName(
    @Param('serviceName') serviceName: string,
  ): Promise<DeleteServiceDocResponse> {
    return await this.serviceDocsService.delete(serviceName);
  }
}
