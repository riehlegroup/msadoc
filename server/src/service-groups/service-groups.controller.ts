import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { JwtAccessAuthGuard } from '../auth/jwt-access.guard';
import { ServiceGroupsService } from './service-groups.service';

@ApiTags('service-groups')
@Controller('service-groups')
export class ServiceGroupsController {
  constructor(private readonly groupsService: ServiceGroupsService) {}

  @UseGuards(JwtAccessAuthGuard)
  @ApiSecurity('jwt')
  @Get()
  @HttpCode(200)
  getAllGroups() {
    return this.groupsService.getAllGroupsHierarchical();
  }
}
