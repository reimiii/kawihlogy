import { Module } from '@nestjs/common';
import { PoemService } from './poem.service';
import { PoemController } from './poem.controller';
import { PoemRepository } from './repositories/poem.repository';
import { BullModule } from '@nestjs/bullmq';
import { PoemStrings } from './constants/poem-strings.constant';
import { PoemConsumer } from './poem.consumer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: PoemStrings.POEM_QUEUE,
    }),
  ],
  controllers: [PoemController],
  providers: [PoemService, PoemRepository, PoemConsumer],
  exports: [PoemService],
})
export class PoemModule {}
