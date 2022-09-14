import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RepositoryMockFactory } from '../repository-factory.mock';
import { ServiceDocOrm } from '../service-docs/service-doc.orm';
import { ServiceDocsService } from '../service-docs/service-docs.service';
import { ServiceGroupsController } from './service-groups.controller';
import { ServiceGroupsService } from './service-groups.service';

describe('ServiceGroupsController', () => {
  let controller: ServiceGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiceGroupsController],
      providers: [
        ServiceGroupsService,
        ServiceDocsService,
        {
          provide: getRepositoryToken(ServiceDocOrm),
          useFactory: RepositoryMockFactory,
        },
      ],
    }).compile();

    controller = module.get<ServiceGroupsController>(ServiceGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
