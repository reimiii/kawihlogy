import { Exclude, Expose } from 'class-transformer';
import { Role } from 'src/auth/enums/role.enum';

@Exclude()
export class UserMinimalDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  role: Role;

  constructor(args: UserMinimalDto) {
    Object.assign(this, args);
  }
}
