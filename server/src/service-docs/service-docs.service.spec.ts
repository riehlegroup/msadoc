import { Test, TestingModule } from '@nestjs/testing';
import { MockType, RepositoryMockFactory } from '../repository-factory.mock';
import { Repository } from 'typeorm';
import { ServiceDocOrm } from './service-doc.orm';
import { ServiceDocModel, ServiceDocsService } from './service-docs.service';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ServiceDocsService', () => {
  let service: ServiceDocsService;
  let repositoryMock: MockType<Repository<ServiceDocOrm>>;

  const mockedServiceDoc: ServiceDocOrm = {
    name: 'MyTestService',
    group: null,
    tags: null,
    repository: null,
    taskBoard: null,
    consumedAPIs: null,
    subscribedEvents: null,
    publishedEvents: null,
    providedAPIs: null,
    apiDocumentation: null,
    deploymentDocumentation: null,
    developmentDocumentation: null,
    responsibles: null,
    responsibleTeam: null,
    creationTimestamp: new Date(Date.now()),
    updateTimestamp: new Date(Date.now()),
  };
  const expectedServiceDoc: ServiceDocModel = {
    name: mockedServiceDoc.name,
    creationTimestamp: mockedServiceDoc.creationTimestamp,
    updateTimestamp: mockedServiceDoc.updateTimestamp,
  };

  const exampleServiceDoc: ServiceDocModel = {
    name: mockedServiceDoc.name,
    creationTimestamp: new Date(Date.now()),
    updateTimestamp: new Date(Date.now()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceDocsService,
        {
          provide: getRepositoryToken(ServiceDocOrm),
          useFactory: RepositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<ServiceDocsService>(ServiceDocsService);
    repositoryMock = module.get(getRepositoryToken(ServiceDocOrm));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create service-doc', async () => {
    repositoryMock.findBy?.mockReturnValue([mockedServiceDoc]);
    repositoryMock.save?.mockReturnValue(mockedServiceDoc);

    const serviceDoc = await service.create(exampleServiceDoc);

    expect(repositoryMock.save).toHaveBeenCalledTimes(1);
    expect(serviceDoc).toEqual(expectedServiceDoc);
  });

  it('should delete service-doc', async () => {
    repositoryMock.findBy?.mockReturnValue([mockedServiceDoc]);
    repositoryMock.delete?.mockReturnValue({});

    const deleted = await service.delete(mockedServiceDoc.name);

    expect(repositoryMock.delete).toHaveBeenCalledTimes(1);
    expect(repositoryMock.delete).toHaveBeenCalledWith({
      name: mockedServiceDoc.name,
    });
    expect(deleted).toEqual(expectedServiceDoc);
  });

  it('should list service-doc', async () => {
    repositoryMock.find?.mockReturnValue([mockedServiceDoc]);

    const allServiceDocs = await service.getAll();

    expect(repositoryMock.find).toHaveBeenCalledTimes(1);
    expect(allServiceDocs).toContainEqual(expectedServiceDoc);
  });

  it('should get service-doc', async () => {
    repositoryMock.findBy?.mockReturnValue([mockedServiceDoc]);

    const found = await service.getByName(mockedServiceDoc.name);

    expect(repositoryMock.findBy).toHaveBeenCalledTimes(1);
    expect(repositoryMock.findBy).toHaveBeenCalledWith({
      name: mockedServiceDoc.name,
    });
    expect(found).toEqual(expectedServiceDoc);
  });
});
