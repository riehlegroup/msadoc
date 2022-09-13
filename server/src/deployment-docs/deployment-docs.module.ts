import { Module } from '@nestjs/common';
import { DeploymentDocsService } from './deployment-docs.service';
import { DeploymentDocsController } from './deployment-docs.controller';
import { DeploymentDocOrm } from './deployment-doc.orm';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([DeploymentDocOrm])],
  controllers: [DeploymentDocsController],
  providers: [DeploymentDocsService],
})
export class DeploymentDocsModule {}
