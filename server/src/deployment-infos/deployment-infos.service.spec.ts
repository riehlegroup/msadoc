import { Test, TestingModule } from '@nestjs/testing';
import { DeploymentInfosService } from './deployment-infos.service';

describe('DeploymentInfosService', () => {
  let service: DeploymentInfosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeploymentInfosService],
    }).compile();

    service = module.get<DeploymentInfosService>(DeploymentInfosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
