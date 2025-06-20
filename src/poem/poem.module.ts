import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { FileModule } from 'src/_infrastructure/file/file.module';
import { GeminiModule } from 'src/_infrastructure/gemini/gemini.module';
import { JournalModule } from 'src/journal/journal.module';
import { PoemStrings } from './constants/poem-strings.constant';
import { PoemController } from './poem.controller';
import { PoemGateway } from './poem.gateway';
import { PoemService } from './poem.service';
import { PoemRepository } from './repositories/poem.repository';
import { PoemEventsListener } from './poem.events-listener';

@Module({
  imports: [
    GeminiModule,
    JournalModule,
    FileModule,
    BullModule.registerQueue({
      name: PoemStrings.POEM_QUEUE,
    }),
  ],
  controllers: [PoemController],
  providers: [
    PoemGateway,
    PoemService,
    PoemRepository,
    PoemEventsListener,
    // HandleGeneratePoemCommand,
    // HandleGeneratePoemAudioCommand,
  ],
  exports: [PoemService],
})
export class PoemModule {}
