import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export const JwtRefreshAuthGuardHandle = 'jwt-refresh';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard(JwtRefreshAuthGuardHandle) {}
