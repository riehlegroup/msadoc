import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export const ApiKeyAuthGuardHandle = 'api-key';

@Injectable()
export class ApiKeyAuthGuard extends AuthGuard(ApiKeyAuthGuardHandle) {}
