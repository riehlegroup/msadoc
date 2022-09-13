import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockType, RepositoryMockFactory } from '../repository-factory.mock';
import { Repository } from 'typeorm';
import { DeploymentDocOrm } from './deployment-doc.orm';
import {
  DeploymentDocModel,
  DeploymentDocsService,
} from './deployment-docs.service';

describe('DeploymentDocsService', () => {
  let service: DeploymentDocsService;
  let repositoryMock: MockType<Repository<DeploymentDocOrm>>;

  const mockedDeploymentDoc: DeploymentDocOrm = {
    name: 'MyTestDeployment',
    kubernetesUrl: 'localhost:12345',
    kubernetesSkipTlsVerify: null,
    kubernetesCa: null,
    kubernetesPassword: null,
    kubernetesUser: 'k8s-user',
    kubernetesLabels: null,
    kubernetesUserCert: null,
    kubernetesUserKey: null,
    creationTimestamp: new Date(Date.now()),
    updateTimestamp: new Date(Date.now()),
  };
  const expectedDeploymentDoc: DeploymentDocModel = {
    name: mockedDeploymentDoc.name,
    kubernetesUrl: mockedDeploymentDoc.kubernetesUrl,
    kubernetesUser: mockedDeploymentDoc.kubernetesUser,
    creationTimestamp: mockedDeploymentDoc.creationTimestamp,
    updateTimestamp: mockedDeploymentDoc.updateTimestamp,
  };

  const exampleDeploymentDoc: DeploymentDocModel = {
    name: mockedDeploymentDoc.name,
    kubernetesUrl: mockedDeploymentDoc.kubernetesUrl,
    kubernetesUser: mockedDeploymentDoc.kubernetesUser,
    creationTimestamp: new Date(Date.now()),
    updateTimestamp: new Date(Date.now()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeploymentDocsService,
        {
          provide: getRepositoryToken(DeploymentDocOrm),
          useFactory: RepositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<DeploymentDocsService>(DeploymentDocsService);
    repositoryMock = module.get(getRepositoryToken(DeploymentDocOrm));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create deployment-doc', async () => {
    repositoryMock.findBy?.mockReturnValue([mockedDeploymentDoc]);
    repositoryMock.save?.mockReturnValue(mockedDeploymentDoc);

    const deploymentDoc = await service.create(exampleDeploymentDoc);

    expect(repositoryMock.save).toHaveBeenCalledTimes(1);
    expect(deploymentDoc).toEqual(expectedDeploymentDoc);
  });

  it('should delete deployment-doc', async () => {
    repositoryMock.findBy?.mockReturnValue([mockedDeploymentDoc]);
    repositoryMock.delete?.mockReturnValue({});

    const deleted = await service.delete(mockedDeploymentDoc.name);

    expect(repositoryMock.delete).toHaveBeenCalledTimes(1);
    expect(repositoryMock.delete).toHaveBeenCalledWith({
      name: mockedDeploymentDoc.name,
    });
    expect(deleted).toEqual(expectedDeploymentDoc);
  });

  it('should list deployment-doc', async () => {
    repositoryMock.find?.mockReturnValue([mockedDeploymentDoc]);

    const allDeploymentDocs = await service.getAll();

    expect(repositoryMock.find).toHaveBeenCalledTimes(1);
    expect(allDeploymentDocs).toContainEqual(expectedDeploymentDoc);
  });

  it('should get deployment-doc', async () => {
    repositoryMock.findBy?.mockReturnValue([mockedDeploymentDoc]);

    const found = await service.getByName(mockedDeploymentDoc.name);

    expect(repositoryMock.findBy).toHaveBeenCalledTimes(1);
    expect(repositoryMock.findBy).toHaveBeenCalledWith({
      name: mockedDeploymentDoc.name,
    });
    expect(found).toEqual(expectedDeploymentDoc);
  });
});
