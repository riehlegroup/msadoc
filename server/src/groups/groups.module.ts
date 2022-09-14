import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { ServiceDocsModule } from '../service-docs/service-docs.module';

@Module({
  imports: [ServiceDocsModule],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
