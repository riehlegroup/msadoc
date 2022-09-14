import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { JwtAccessAuthGuard } from '../auth/jwt-access.guard';
import { ServiceGroupsService } from './service-groups.service';

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
