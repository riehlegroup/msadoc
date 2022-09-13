import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RepositoryMockFactory } from '../repository-factory.mock';
import { DeploymentDocOrm } from './deployment-doc.orm';
import { DeploymentDocsController } from './deployment-docs.controller';
import { DeploymentDocsService } from './deployment-docs.service';

describe('DeploymentDocsController', () => {
  let controller: DeploymentDocsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeploymentDocsController],
      providers: [
        DeploymentDocsService,
        {
          provide: getRepositoryToken(DeploymentDocOrm),
          useFactory: RepositoryMockFactory,
        },
      ],
    }).compile();

    controller = module.get<DeploymentDocsController>(DeploymentDocsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
