import { Module } from '@nestjs/common';
import { ServiceGroupsService } from './service-groups.service';
import { ServiceGroupsController } from './service-groups.controller';
import { ServiceDocsModule } from '../service-docs/service-docs.module';

@Module({
  imports: [ServiceDocsModule],
  controllers: [ServiceGroupsController],
  providers: [ServiceGroupsService],
})
export class ServiceGroupsModule {}
