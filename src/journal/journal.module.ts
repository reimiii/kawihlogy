import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { PoemStrings } from 'src/poem/constants/poem-strings.constant';
import { UserModule } from 'src/user/user.module';
import { CreateJournalCommand } from './commands/create-journal.command';
import { DeleteJournalCommand } from './commands/delete-journal.command';
import { UpdateJournalCommand } from './commands/update-journal.command';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';
import { JournalRepository } from './repositories/journal.repository';
import { PoemModule } from 'src/poem/poem.module';

@Module({
  imports: [
    UserModule,
    PoemModule,
    BullModule.registerQueue({
      name: PoemStrings.POEM_QUEUE,
    }),
  ],
  controllers: [JournalController],
  providers: [
    JournalService,
    JournalRepository,
    CreateJournalCommand,
    UpdateJournalCommand,
    DeleteJournalCommand,
  ],
  exports: [JournalService],
})
export class JournalModule {}
