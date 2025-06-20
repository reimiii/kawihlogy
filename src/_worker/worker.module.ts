import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { FileModule } from 'src/_infrastructure/file/file.module';
import { GeminiModule } from 'src/_infrastructure/gemini/gemini.module';
import { InfrastructureModule } from 'src/_infrastructure/infrastructure.module';
import { StorageModule } from 'src/_infrastructure/storage/storage.module';
import { PoemStrings } from 'src/poem/constants/poem-strings.constant';
import { HandleGeneratePoemAudioCommand } from './commands/handle-generate-poem-audio.command';
import { HandleGeneratePoemCommand } from './commands/handle-generate-poem.command';
import { PoemProcessor } from './poem.processor';
import { PoemProvider } from './worker.provider';

@Module({
  imports: [
    InfrastructureModule,
    GeminiModule,
    StorageModule,
    FileModule,
    BullModule.registerQueue({
      name: PoemStrings.POEM_QUEUE,
    }),
  ],
  providers: [
    PoemProcessor,
    ...PoemProvider,
    HandleGeneratePoemAudioCommand,
    HandleGeneratePoemCommand,
  ],
})
export class WorkerModule {}
