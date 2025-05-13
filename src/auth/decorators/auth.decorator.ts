import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { PermissionGuard } from '../guards/permission.guard';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';

export const AUTH_KEY = 'auth_permissions';
export const Auth = (...permissions: Permissions[]) =>
  applyDecorators(
    SetMetadata(AUTH_KEY, permissions),
    UseGuards(JwtAuthGuard, PermissionGuard),
  );
