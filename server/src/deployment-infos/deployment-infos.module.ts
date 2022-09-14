import { Module } from '@nestjs/common';
import { ServiceDocsModule } from '../service-docs/service-docs.module';
import { DeploymentDocsModule } from '../deployment-docs/deployment-docs.module';
import { DeploymentInfosController } from './deployment-infos.controller';
import { DeploymentInfosService } from './deployment-infos.service';

@Module({
  imports: [DeploymentDocsModule, ServiceDocsModule],
  controllers: [DeploymentInfosController],
  providers: [DeploymentInfosService],
})
export class DeploymentInfosModule {}
