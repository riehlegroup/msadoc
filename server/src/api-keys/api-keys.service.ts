import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { ApiKeyOrm } from './api-key.orm';

interface ApiKeyModel {
  id: number;
  keyName: string;
  apiKey: string;
  creationTimestamp: Date;
}

function fromOrm(entity: ApiKeyOrm): ApiKeyModel {
  return {
    id: entity.id,
    keyName: entity.keyName,
    apiKey: entity.apiKey,
    creationTimestamp: entity.creationTimestamp,
  };
}

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKeyOrm)
    private apiKeysRepository: Repository<ApiKeyOrm>,
  ) {}

  private readonly KEY_LENGTH = 36;

  async create(keyName: string): Promise<ApiKeyModel> {
    const apiKey = crypto.randomBytes(this.KEY_LENGTH).toString('hex');
    const created = await this.apiKeysRepository.save({
      keyName: keyName,
      apiKey: apiKey,
    });
    return fromOrm(created);
  }

  async getAll(): Promise<ApiKeyModel[]> {
    const allEntities = await this.apiKeysRepository.find();
    return allEntities.map((x) => fromOrm(x));
  }

  async check(apiKey: string): Promise<boolean> {
    const results = await this.apiKeysRepository.findBy({ apiKey: apiKey });
    return results.length > 0;
  }

  async delete(id: number): Promise<void> {
    await this.apiKeysRepository.delete({ id: id });
  }

  async deleteAll(): Promise<void> {
    await this.apiKeysRepository.delete({});
  }
}
