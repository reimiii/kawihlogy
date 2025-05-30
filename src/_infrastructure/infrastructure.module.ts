import { Module } from '@nestjs/common';
import { EnvModule } from './env/env.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';
import { BullModule } from './queue/queue.module';

@Module({
  imports: [ConfigModule, EnvModule, DatabaseModule, BullModule],
})
export class InfrastructureModule {}
