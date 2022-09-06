import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  private apiKeys = new Map<string, string>();
  private readonly KEY_LENGTH = 36;

  create(keyName: string): string {
    const apiKey = crypto.randomBytes(this.KEY_LENGTH).toString('hex');
    this.apiKeys.set(keyName, apiKey);
    return apiKey;
  }

  getAllKeys(): string[] {
    return [...this.apiKeys.keys()];
  }

  check(apiKey: string): boolean {
    return new Set(this.apiKeys.values()).has(apiKey);
  }

  delete(keyName: string): void {
    this.apiKeys.delete(keyName);
  }
}
