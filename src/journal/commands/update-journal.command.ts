import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { UpdateJournalCommandOptions } from '../types/journal.type';
import { JournalRepository } from '../repositories/journal.repository';
import { Journal } from '../entities/journal.entity';

@Injectable({ scope: Scope.TRANSIENT })
export class UpdateJournalCommand {
  private readonly logger = new Logger(UpdateJournalCommand.name);
  private _context!: UpdateJournalCommandOptions;
  private _journal: Journal;

  constructor(private readonly journalRepository: JournalRepository) {}

  private get journal(): Journal {
    if (!this._journal)
      throw new InternalServerErrorException(
        `${this.assertJournalExists.name} is not initialized`,
      );
    return this._journal;
  }

  public async execute(params: UpdateJournalCommandOptions): Promise<void> {
    this.logger.log('starting update journal command');
    this._context = params;

    await this.assertJournalExists();

    this.assertJournalAccessible();

    await this.updateJournal();

    this.logger.log('finish update journal command');
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

  private async updateJournal(): Promise<void> {
    const {
      payload: { content, date, isPrivate },
      entityManager,
    } = this._context;

    await this.journalRepository.persist({
      entity: {
        id: this.journal.id,
        content: content ?? this.journal.content,
        date: date ?? this.journal.date,
        isPrivate: isPrivate ?? this.journal.isPrivate,
      },
      manager: entityManager,
    });
  }

  private assertJournalAccessible(): void {
    const journalOwnerId = this.journal.userId;
    const requesterId = this._context.updateBy.id;

    if (journalOwnerId !== requesterId)
      throw new ForbiddenException('Access denied');
  }
}
