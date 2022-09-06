import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeysService } from './api-keys.service';

describe('ApiKeysService', () => {
  let service: ApiKeysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiKeysService],
    }).compile();

    service = module.get<ApiKeysService>(ApiKeysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create api-key', async () => {
    service.create('test');
    expect(service.getAllKeys()).toContain('test');
  });

  it('should create valid api-key', async () => {
    const apiKey = service.create('test');
    expect(service.check(apiKey)).toBe(true);
  });

  it('should delete api-key', async () => {
    service.create('test');
    service.delete('test');
    expect(service.getAllKeys()).not.toContain('test');
  });

  it('should not validate invalid api-key', async () => {
    const apiKey = 'testkey';
    expect(service.check(apiKey)).toBe(false);
  });

  it('should not validate deleted api-key', async () => {
    const apiKey = service.create('test');
    service.delete('test');
    expect(service.check(apiKey)).toBe(false);
  });
});
