import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { CreateJournalCommand } from './commands/create-journal.command';
import { DeleteJournalCommand } from './commands/delete-journal.command';
import { UpdateJournalCommand } from './commands/update-journal.command';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';
import { JournalRepository } from './repositories/user.repository';

@Module({
  imports: [UserModule],
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
