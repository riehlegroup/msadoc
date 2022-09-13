import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeploymentDocOrm } from '../deployment-docs/deployment-doc.orm';
import { RepositoryMockFactory } from '../repository-factory.mock';
import { DeploymentDocsService } from '../deployment-docs/deployment-docs.service';
import { DeploymentInfosController } from './deployment-infos.controller';
import { DeploymentInfosService } from './deployment-infos.service';

describe('DeploymentInfosController', () => {
  let controller: DeploymentInfosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeploymentInfosController],
      providers: [
        DeploymentInfosService,
        DeploymentDocsService,
        {
          provide: getRepositoryToken(DeploymentDocOrm),
          useFactory: RepositoryMockFactory,
        },
      ],
    }).compile();

    controller = module.get<DeploymentInfosController>(
      DeploymentInfosController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
