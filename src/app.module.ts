import { Module } from '@nestjs/common';
import { InfrastructureModule } from './_infrastructure/infrastructure.module';
import { AuthModule } from './auth/auth.module';
import { JournalModule } from './journal/journal.module';
import { PoemModule } from './poem/poem.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    InfrastructureModule,
    AuthModule,
    UserModule,
    JournalModule,
    PoemModule,
  ],
})
export class AppModule {}
