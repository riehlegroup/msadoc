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
import { ApiParam, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuardHandle } from '../api-keys/api-key.guard';
import { JwtAccessAuthGuardHandle } from '../auth/jwt-access.guard';
import {
  CreateServiceDocRequest,
  CreateServiceDocResponse,
  DeleteServiceDocResponse,
  GetServiceDocResponse,
  ListServiceDocResponse,
} from './service-doc.dto';
import { ServiceDocsService } from './service-docs.service';

@Controller('service-docs')
@ApiTags('service-docs')
@UseGuards(AuthGuard([JwtAccessAuthGuardHandle, ApiKeyAuthGuardHandle]))
@ApiSecurity(JwtAccessAuthGuardHandle)
@ApiSecurity(ApiKeyAuthGuardHandle)
@ApiResponse({
  status: 401,
  description: 'Unauthorized. Login to get access_token or use an api-token.',
})
export class ServiceDocsController {
  constructor(private serviceDocsService: ServiceDocsService) {}

  @Post('/')
  @HttpCode(201)
  @ApiResponse({
    status: 201,
    description: 'Successfully created and returned a service-doc.',
  })
  async createServiceDoc(
    @Body() createDto: CreateServiceDocRequest,
  ): Promise<CreateServiceDocResponse> {
    return await this.serviceDocsService.create(createDto);
  }

  @Get('/')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Fetched all service-docs.',
  })
  async listAllServiceDocs(): Promise<ListServiceDocResponse> {
    return {
      serviceDocs: await this.serviceDocsService.getAll(),
    };
  }

  @Get('/:serviceName')
  @HttpCode(200)
  @ApiParam({
    name: 'serviceName',
    description: 'Name of the service-doc to be fetched',
  })
  @ApiResponse({
    status: 200,
    description: 'Fetched service-docs by given name.',
  })
  async getServiceDocByName(
    @Param('serviceName') serviceName: string,
  ): Promise<GetServiceDocResponse> {
    return await this.serviceDocsService.getByName(serviceName);
  }

  @Delete('/')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Deleted all service-docs.',
  })
  async deleteAllServiceDocs(): Promise<void> {
    await this.serviceDocsService.deleteAll();
  }

  @Delete('/:serviceName')
  @HttpCode(200)
  @ApiParam({
    name: 'serviceName',
    description: 'Name of the service-doc to be deleted',
  })
  @ApiResponse({
    status: 200,
    description: 'Deleted service-doc by given name.',
  })
  async deleteServiceDocByName(
    @Param('serviceName') serviceName: string,
  ): Promise<DeleteServiceDocResponse> {
    return await this.serviceDocsService.delete(serviceName);
  }
}
