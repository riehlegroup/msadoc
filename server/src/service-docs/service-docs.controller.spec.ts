import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RepositoryMockFactory } from '../repository-factory.mock';
import { ServiceDocOrm } from './service-doc.orm';
import { ServiceDocsController } from './service-docs.controller';
import { ServiceDocsService } from './service-docs.service';

describe('ServiceDocsController', () => {
  let controller: ServiceDocsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceDocsController],
      providers: [
        ServiceDocsService,
        {
          provide: getRepositoryToken(ServiceDocOrm),
          useFactory: RepositoryMockFactory,
        },
      ],
    }).compile();

    controller = module.get<ServiceDocsController>(ServiceDocsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
