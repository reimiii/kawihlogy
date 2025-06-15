import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { GeminiModule } from 'src/_infrastructure/gemini/gemini.module';
import { JournalModule } from 'src/journal/journal.module';
import { HandleGeneratePoemCommand } from './commands/handle-generate-poem.command';
import { PoemStrings } from './constants/poem-strings.constant';
import { PoemConsumer } from './poem.consumer';
import { PoemController } from './poem.controller';
import { PoemService } from './poem.service';
import { PoemRepository } from './repositories/poem.repository';
import { PoemEventsListener } from './poem.events-listener';
import { PoemGateway } from './poem.gateway';

@Module({
  imports: [
    GeminiModule,
    JournalModule,
    BullModule.registerQueue({
      name: PoemStrings.POEM_QUEUE,
    }),
  ],
  controllers: [PoemController],
  providers: [
    PoemGateway,
    PoemService,
    PoemRepository,
    PoemConsumer,
    PoemEventsListener,
    HandleGeneratePoemCommand,
  ],
  exports: [PoemService],
})
export class PoemModule {}
