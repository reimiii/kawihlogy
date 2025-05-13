import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserClaims } from 'src/auth/types/jwt-payload.type';

export const Identity = createParamDecorator<unknown>(
  (_: unknown, ctx: ExecutionContext): UserClaims => {
    const http = ctx.switchToHttp();
    const request = http.getRequest<Request>();

    if (!request.user) throw new UnauthorizedException();

    return request.user;
  },
);
