import { forwardRef, Module } from '@nestjs/common';
import { PoemService } from './poem.service';
import { PoemController } from './poem.controller';
import { PoemRepository } from './repositories/poem.repository';
import { BullModule } from '@nestjs/bullmq';
import { PoemStrings } from './constants/poem-strings.constant';
import { PoemConsumer } from './poem.consumer';
import { HandleGeneratePoemCommand } from './commands/handle-generate-poem.command';
import { GeminiModule } from 'src/_infrastructure/gemini/gemini.module';
import { JournalModule } from 'src/journal/journal.module';

@Module({
  imports: [
    GeminiModule,
    forwardRef(() => JournalModule),
    BullModule.registerQueue({
      name: PoemStrings.POEM_QUEUE,
    }),
  ],
  controllers: [PoemController],
  providers: [
    PoemService,
    PoemRepository,
    PoemConsumer,
    HandleGeneratePoemCommand,
  ],
  exports: [PoemService],
})
export class PoemModule {}
