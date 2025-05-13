import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_KEY } from '../auth.decorator';
import { Permission } from '../enums/permission.enum';
import { Request } from 'express';
import { RolesPermissions } from '../constants/roles-permissions.map';
import { Role } from '../enums/role.enum';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const request = context.switchToHttp().getRequest<Request>();

    const user = request.user;

    if (!user?.role || !Object.values(Role).includes(user.role)) {
      const reason = !user
        ? 'user not found'
        : !user.role
          ? 'role is missing'
          : 'invalid role';

      throw new ForbiddenException(reason);
    }

    const rolePermissions = RolesPermissions[user.role];

    const hasPermission = requiredPermissions.every((p) => rolePermissions[p]);

    if (!hasPermission)
      throw new ForbiddenException('insufficient permissions');

    return true;
  }
}
