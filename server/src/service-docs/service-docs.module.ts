import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceDocOrm } from './service-doc.orm';
import { ServiceDocsController } from './service-docs.controller';
import { ServiceDocsService } from './service-docs.service';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceDocOrm])],
  controllers: [ServiceDocsController],
  providers: [ServiceDocsService],
})
export class ServiceDocsModule {}
