import { Permission } from '../enums/permission.enum';
import { Role } from '../enums/role.enum';

export const RolesPermissions: Record<
  Role,
  Partial<Record<Permission, boolean>>
> = {
  [Role.Echo]: {
    [Permission.JOURNAL_READ]: true,
    [Permission.POEM_READ]: true,
  },
  [Role.Scribe]: {
    [Permission.JOURNAL_CREATE]: true,
    [Permission.JOURNAL_READ]: true,
    [Permission.JOURNAL_UPDATE]: true,
    [Permission.JOURNAL_DELETE]: true,
    [Permission.POEM_READ]: true,
  },
  [Role.Weavemaster]: {
    [Permission.JOURNAL_READ]: true,
    [Permission.POEM_READ]: true,
    [Permission.POEM_PUBLISH]: true,
    [Permission.POEM_EDIT]: true,
    [Permission.POEM_SHARE]: true,
  },
  [Role.Overseer]: {
    [Permission.JOURNAL_CREATE]: true,
    [Permission.JOURNAL_READ]: true,
    [Permission.JOURNAL_UPDATE]: true,
    [Permission.JOURNAL_DELETE]: true,
    [Permission.POEM_READ]: true,
    [Permission.POEM_PUBLISH]: true,
    [Permission.POEM_EDIT]: true,
    [Permission.POEM_SHARE]: true,
    [Permission.USER_MANAGE]: true,
  },
};
