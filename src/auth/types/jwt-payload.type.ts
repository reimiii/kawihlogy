import { User } from 'src/user/entities/user.entity';

// This is non sense, and i thing this is good... maybe
export type BaseClaims = Pick<User, 'id' | 'email' | 'role'>;
export type JwtPayload = BaseClaims;
export type UserClaims = BaseClaims;
