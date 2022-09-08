import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MockType, RepositoryMockFactory } from '../repository-factory.mock';
import { ApiKeyOrm } from './api-key.orm';
import { ApiKeysService } from './api-keys.service';

describe('ApiKeysService', () => {
  let service: ApiKeysService;
  let repositoryMock: MockType<Repository<ApiKeyOrm>>;

  const mockedApiKey: ApiKeyOrm = {
    id: 1,
    keyName: 'test-key',
    apiKey: 'key-12345',
    creationTimestamp: new Date(Date.now()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeysService,
        {
          provide: getRepositoryToken(ApiKeyOrm),
          useFactory: RepositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<ApiKeysService>(ApiKeysService);
    repositoryMock = module.get(getRepositoryToken(ApiKeyOrm));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create api-key', async () => {
    repositoryMock.save?.mockReturnValue(mockedApiKey);

    const apiKey = await service.create('test');

    expect(repositoryMock.save).toHaveBeenCalledTimes(1);
    expect(apiKey).toEqual(mockedApiKey);
  });

  it('should create valid api-key', async () => {
    repositoryMock.findBy?.mockReturnValue([mockedApiKey]);

    const isKeyValid = await service.check(mockedApiKey.apiKey);

    expect(repositoryMock.findBy).toHaveBeenCalledWith({
      apiKey: mockedApiKey.apiKey,
    });
    expect(isKeyValid).toBe(true);
  });

  it('should delete api-key', async () => {
    repositoryMock.delete?.mockReturnValue({});

    await service.delete(mockedApiKey.id);

    expect(repositoryMock.delete).toHaveBeenCalledTimes(1);
    expect(repositoryMock.delete).toHaveBeenCalledWith({
      id: mockedApiKey.id,
    });
  });

  it('should not validate invalid api-key', async () => {
    repositoryMock.findBy?.mockReturnValue([]);

    const isKeyValid = await service.check(mockedApiKey.apiKey);

    expect(repositoryMock.findBy).toHaveBeenCalledWith({
      apiKey: mockedApiKey.apiKey,
    });
    expect(isKeyValid).toBe(false);
  });
});
