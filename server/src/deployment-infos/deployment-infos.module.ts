import { Module } from '@nestjs/common';
import { DeploymentDocsModule } from '../deployment-docs/deployment-docs.module';
import { DeploymentInfosController } from './deployment-infos.controller';
import { DeploymentInfosService } from './deployment-infos.service';

@Module({
  imports: [DeploymentDocsModule],
  controllers: [DeploymentInfosController],
  providers: [DeploymentInfosService],
})
export class DeploymentInfosModule {}
