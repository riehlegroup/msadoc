import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'user_name') {
                return 'admin';
              } else if (key === 'user_password') {
                return 'password';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find default user', async () => {
    expect(await service.findOne('admin')).toBeDefined();
  });

  it('should not find not existing user', async () => {
    expect(await service.findOne('admin_incorrect')).not.toBeDefined();
  });
});
