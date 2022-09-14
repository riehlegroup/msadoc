import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RepositoryMockFactory } from '../repository-factory.mock';
import { ServiceDocOrm } from '../service-docs/service-doc.orm';
import { ServiceDocsService } from '../service-docs/service-docs.service';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

describe('GroupsController', () => {
  let controller: GroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [
        GroupsService,
        ServiceDocsService,
        {
          provide: getRepositoryToken(ServiceDocOrm),
          useFactory: RepositoryMockFactory,
        },
      ],
    }).compile();

    controller = module.get<GroupsController>(GroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
