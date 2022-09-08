import { ObjectLiteral, Repository } from 'typeorm';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<unknown>;
};

export const RepositoryMockFactory: <T extends ObjectLiteral>() => MockType<
  Repository<T>
> = jest.fn(<T>() => ({
  findOne: jest.fn((entity: T) => entity),
  find: jest.fn((entities: T[]) => entities),
  findBy: jest.fn((entities: T[]) => entities),
  save: jest.fn((entity: T) => entity),
  delete: jest.fn(),
}));
