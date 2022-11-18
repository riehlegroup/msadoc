import { Test, TestingModule } from '@nestjs/testing';
import { MockType, RepositoryMockFactory } from '../repository-factory.mock';
import { Repository } from 'typeorm';
import { ServiceDocOrm } from './service-doc.orm';
import {
  fromOrm,
  ServiceDocModel,
  ServiceDocsService,
  toOrm,
} from './service-docs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExtensionObject } from './extensions';

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
    extensions: null,
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

describe('ServiceDocs ORM conversion', () => {
  it('should convert valid extension fields', () => {
    const model = {
      name: 'test',
      extensions: {
        'x-test1': 123,
        'x-test2': 'asd',
        'x-test3': false,
        'x-test4': [123, 'asd', false],
      },
    };

    const orm = toOrm(model);
    expect(orm.extensions).not.toBeNull();
    const ormExtensions = orm.extensions as ExtensionObject;
    expect(ormExtensions['x-test1']).toEqual(123);
    expect(ormExtensions['x-test2']).toEqual('asd');
    expect(ormExtensions['x-test3']).toEqual(false);
    expect(ormExtensions['x-test4']).toContain(123);
    expect(ormExtensions['x-test4']).toContain('asd');
    expect(ormExtensions['x-test4']).toContain(false);
  });

  it('should convert back extension fields', () => {
    const orm: ServiceDocOrm = {
      name: 'test',
      extensions: {
        'x-test1': 123,
        'x-test2': 'asd',
        'x-test3': false,
        'x-test4': [123, 'asd', false],
      },
      group: null,
      tags: null,
      repository: null,
      taskBoard: null,
      consumedAPIs: null,
      providedAPIs: null,
      publishedEvents: null,
      subscribedEvents: null,
      developmentDocumentation: null,
      deploymentDocumentation: null,
      apiDocumentation: null,
      responsibleTeam: null,
      responsibles: null,
      creationTimestamp: new Date(),
      updateTimestamp: new Date(),
    };

    const model = fromOrm(orm) as unknown as any;
    expect(model.extensions['x-test1']).toEqual(123);
    expect(model.extensions['x-test2']).toEqual('asd');
    expect(model.extensions['x-test3']).toEqual(false);
    expect(model.extensions['x-test4']).toContain(123);
    expect(model.extensions['x-test4']).toContain('asd');
    expect(model.extensions['x-test4']).toContain(false);
  });
});
