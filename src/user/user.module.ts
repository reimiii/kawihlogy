import { Module } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './user.service';

@Module({
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
