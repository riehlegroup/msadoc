import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn((name: string) => {
              if (name === 'admin') {
                return {
                  name: 'admin',
                  password: 'password',
                };
              }
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate correct user', async () => {
    expect(await service.validateUser('admin', 'password')).toBeDefined();
  });

  it('should not validate incorrect user', async () => {
    expect(
      await service.validateUser('admin_incorrect', 'password'),
    ).not.toBeDefined();
  });

  it('should not validate incorrect password', async () => {
    expect(
      await service.validateUser('admin', 'password_incorrect'),
    ).not.toBeDefined();
  });
});
