import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserClaims } from 'src/auth/types/jwt-payload.type';

export const OptionalIdentity = createParamDecorator<unknown>(
  (_: unknown, ctx: ExecutionContext): UserClaims | undefined => {
    const http = ctx.switchToHttp();
    const request = http.getRequest<Request>();
    return request.user;
  },
);
