/* eslint-disable  */
import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { firstValueFrom, isObservable } from 'rxjs';
import { IS_PUBLIC_KEY } from 'src/core/decorators/is-public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    this.logger.log(`Route isPublic: ${isPublic}`);

    if (isPublic) {
      try {
        const result = await Promise.resolve(super.canActivate(context));
        this.logger.log(`super.canActivate (public) raw result: ${result}`);

        if (isObservable(result)) {
          const resolved = await firstValueFrom(result);
          this.logger.log(
            `super.canActivate (public) resolved Observable: ${resolved}`,
          );
        } else {
          this.logger.log(
            `super.canActivate (public) resolved value: ${result}`,
          );
        }
      } catch (err) {
        this.logger.warn(
          `super.canActivate (public) failed with error: ${err.message}`,
        );
      }

      return true;
    }

    const result = await Promise.resolve(super.canActivate(context));
    this.logger.log(`super.canActivate (protected) raw result: ${result}`);

    if (isObservable(result)) {
      const resolved = await firstValueFrom(result);
      this.logger.log(
        `super.canActivate (protected) resolved Observable: ${resolved}`,
      );
      return resolved;
    }

    return result;
  }

  handleRequest<UserClaims>(
    err: any,
    user: UserClaims,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): UserClaims | undefined {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      if (user) {
        return user;
      }
      return undefined;
    }

    if (err || !user) throw err || new UnauthorizedException();
    return user;
  }
}
