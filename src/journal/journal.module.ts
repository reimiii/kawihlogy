import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { CreateJournalCommand } from './commands/create-journal.command';
import { DeleteJournalCommand } from './commands/delete-journal.command';
import { UpdateJournalCommand } from './commands/update-journal.command';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';
import { JournalRepository } from './repositories/journal.repository';
import { FileModule } from 'src/_infrastructure/file/file.module';

@Module({
  imports: [UserModule, FileModule],
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
