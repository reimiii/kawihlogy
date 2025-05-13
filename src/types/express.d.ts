import { User } from 'src/user/entities/user.entity';

declare module 'express' {
  interface Request {
    user?: Pick<User, 'id' | 'role'>;
  }
}
