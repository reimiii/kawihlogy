import { Module } from '@nestjs/common';
import { EnvModule } from './env/env.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';
import { BullModule } from './queue/queue.module';
import { GeminiModule } from './gemini/gemini.module';
import { FileModule } from './file/file.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule,
    EnvModule,
    DatabaseModule,
    BullModule,
    GeminiModule,
    FileModule,
    StorageModule,
  ],
})
export class InfrastructureModule {}
