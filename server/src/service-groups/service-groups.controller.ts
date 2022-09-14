import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuardHandle } from '../api-keys/api-key.guard';
import {
  JwtAccessAuthGuard,
  JwtAccessAuthGuardHandle,
} from '../auth/jwt-access.guard';
import { GetServiceGroupResponse } from './service-group.dto';
import { ServiceGroupsService } from './service-groups.service';

@Controller('service-groups')
@ApiTags('service-groups')
@UseGuards(JwtAccessAuthGuard)
@ApiSecurity(JwtAccessAuthGuardHandle)
@ApiSecurity(ApiKeyAuthGuardHandle)
@ApiResponse({
  status: 401,
  description: 'Unauthorized. Login to get access_token.',
})
export class ServiceGroupsController {
  constructor(private readonly groupsService: ServiceGroupsService) {}

  @Get()
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Fetched all services-groups.',
    type: GetServiceGroupResponse,
  })
  async getAllGroups(): Promise<GetServiceGroupResponse> {
    return await this.groupsService.getAllGroupsHierarchical();
  }
}
