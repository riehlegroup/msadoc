import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RepositoryMockFactory } from '../repository-factory.mock';
import { ServiceDocOrm } from '../service-docs/service-doc.orm';
import {
  ServiceDocModel,
  ServiceDocsService,
} from '../service-docs/service-docs.service';
import { GroupsService } from './groups.service';

describe('GroupsService', () => {
  let service: GroupsService;
  let serviceDocsService: ServiceDocsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        ServiceDocsService,
        {
          provide: getRepositoryToken(ServiceDocOrm),
          useFactory: RepositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
    serviceDocsService = module.get<ServiceDocsService>(ServiceDocsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should build example hierarchy', async () => {
    const serviceDocs: ServiceDocModel[] = [
      {
        name: 'AAB',
        group: 'a.a.b',
        creationTimestamp: new Date(),
        updateTimestamp: new Date(),
      },
      {
        name: 'ABA',
        group: 'a.b.a',
        creationTimestamp: new Date(),
        updateTimestamp: new Date(),
      },
    ];
    jest
      .spyOn(serviceDocsService, 'getAll')
      .mockImplementation(async () => serviceDocs);

    const hierarchy = await service.getAllGroupsHierarchical();
    expect(hierarchy).toBeDefined();
    expect(hierarchy.groups.length).toEqual(1);
    expect(hierarchy?.services.length).toEqual(0);

    const groupA = hierarchy.groups.find((x) => x.name === 'a');
    expect(groupA).toBeDefined();
    expect(groupA?.groups.length).toEqual(2);
    expect(groupA?.services.length).toEqual(0);

    const groupAA = groupA?.groups.find((x) => x.name === 'a');
    const groupAB = groupA?.groups.find((x) => x.name === 'b');
    expect(groupAA).toBeDefined();
    expect(groupAA?.groups.length).toEqual(1);
    expect(groupAA?.services.length).toEqual(0);
    expect(groupAB).toBeDefined();
    expect(groupAB?.groups.length).toEqual(1);
    expect(groupAB?.services.length).toEqual(0);

    const groupAAB = groupAA?.groups.find((x) => x.name === 'b');
    const groupABA = groupAB?.groups.find((x) => x.name === 'a');
    expect(groupAAB).toBeDefined();
    expect(groupAAB?.groups.length).toEqual(0);
    expect(groupAAB?.services.length).toEqual(1);
    expect(groupABA).toBeDefined();
    expect(groupABA?.groups.length).toEqual(0);
    expect(groupABA?.services.length).toEqual(1);

    expect(groupAAB?.services).toContainEqual('AAB');
    expect(groupABA?.services).toContainEqual('ABA');
  });

  it('should build collect non-grouped services at root', async () => {
    const serviceDocs: ServiceDocModel[] = [
      {
        name: 'AAB',
        group: 'a.a.b',
        creationTimestamp: new Date(),
        updateTimestamp: new Date(),
      },
      {
        name: 'none',
        creationTimestamp: new Date(),
        updateTimestamp: new Date(),
      },
    ];
    jest
      .spyOn(serviceDocsService, 'getAll')
      .mockImplementation(async () => serviceDocs);

    const hierarchy = await service.getAllGroupsHierarchical();
    expect(hierarchy).toBeDefined();
    expect(hierarchy.groups.length).toEqual(1);
    expect(hierarchy?.services.length).toEqual(1);

    const groupA = hierarchy.groups.find((x) => x.name === 'a');
    expect(groupA).toBeDefined();

    const groupAA = groupA?.groups.find((x) => x.name === 'a');
    expect(groupAA).toBeDefined();
    expect(groupAA?.groups.length).toEqual(1);
    expect(groupAA?.services.length).toEqual(0);

    const groupAAB = groupAA?.groups.find((x) => x.name === 'b');
    expect(groupAAB).toBeDefined();
    expect(groupAAB?.groups.length).toEqual(0);
    expect(groupAAB?.services.length).toEqual(1);

    expect(groupAAB?.services).toContainEqual('AAB');

    expect(hierarchy?.services).toContainEqual('none');
  });
});
