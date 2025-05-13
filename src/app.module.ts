import { Module } from '@nestjs/common';
import { InfrastructureModule } from './_infrastructure/infrastructure.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [InfrastructureModule, AuthModule, UserModule],
})
export class AppModule {}
