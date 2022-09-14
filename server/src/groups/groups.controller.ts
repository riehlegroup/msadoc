import { Controller, Get, HttpCode, UseGuards } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { JwtAccessAuthGuard } from '../auth/jwt-access.guard';
import { GroupsService } from './groups.service';

@Controller('service-groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @UseGuards(JwtAccessAuthGuard)
  @ApiSecurity('jwt')
  @Get()
  @HttpCode(200)
  getAllGroups() {
    return this.groupsService.getAllGroupsHierarchical();
  }
}
