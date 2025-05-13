import { Exclude, Expose } from 'class-transformer';
import { User } from 'src/user/entities/user.entity';
import { RolesPermissions } from '../constants/roles-permissions.map';
import { Role } from '../enums/role.enum';

@Exclude()
export class ProfileResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  role: Role;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  get permissions(): string[] {
    return Object.keys(RolesPermissions[this.role]);
  }

  constructor(user: Partial<User>) {
    Object.assign(this, user);
  }
}
