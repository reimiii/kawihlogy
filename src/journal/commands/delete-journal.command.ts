import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { DeleteJournalCommandOptions } from '../types/journal.type';
import { JournalRepository } from '../repositories/journal.repository';
import { Journal } from '../entities/journal.entity';

@Injectable({ scope: Scope.TRANSIENT })
export class DeleteJournalCommand {
  private readonly logger = new Logger(DeleteJournalCommand.name);
  private _context!: DeleteJournalCommandOptions;
  private _journal: Journal;

  constructor(private readonly journalRepository: JournalRepository) {}

  private get journal(): Journal {
    if (!this._journal)
      throw new InternalServerErrorException(
        `${this.assertJournalExists.name} is not initialized`,
      );
    return this._journal;
  }

  public async execute(params: DeleteJournalCommandOptions): Promise<void> {
    this.logger.log('starting delete journal command');
    this._context = params;

    await this.assertJournalExists();

    this.assertJournalAccessible();

    await this.archivingJournal();

    this.logger.log('finish delete journal command');
  }

  private async assertJournalExists(): Promise<void> {
    const {
      identifier: { id },
      entityManager,
    } = this._context;

    const data = await this.journalRepository.findOneUnique({
      by: { key: 'id', value: id },
      manager: entityManager,
    });

    if (!data) throw new NotFoundException('Journal Not Found');

    this._journal = data;
  }

  private async archivingJournal(): Promise<void> {
    const {
      identifier: { id },
      entityManager,
    } = this._context;

    const res = await this.journalRepository.archive({
      entity: { id: id },
      manager: entityManager,
    });

    console.log(res);
  }

  private assertJournalAccessible(): void {
    const journalOwnerId = this.journal.userId;
    const requesterId = this._context.deleteBy.id;

    if (journalOwnerId !== requesterId)
      throw new ForbiddenException('Access denied');
  }
}
