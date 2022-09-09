import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export const JwtAccessAuthGuardHandle = 'jwt';

@Injectable()
export class JwtAccessAuthGuard extends AuthGuard(JwtAccessAuthGuardHandle) {}
