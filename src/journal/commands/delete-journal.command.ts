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

/**
 * Command class responsible for deleting (archiving) a journal entry.
 *
 * Handles the process of validating the journal's existence, checking access permissions,
 * and archiving the journal entity. Uses dependency injection for the journal repository
 * and logs the execution process.
 *
 * @remarks
 * - Throws {@link NotFoundException} if the journal is not found.
 * - Throws {@link ForbiddenException} if the user is not the owner of the journal.
 * - Throws {@link InternalServerErrorException} if the journal is not loaded before use.
 *
 * @example
 * // Usage in a NestJS service with ModuleRef:
 * await this.moduleRef.resolve(DeleteJournalCommand).then(command =>
 *   command.execute({
 *     identifier: { id: 1 },
 *     deleteBy: user,
 *     entityManager: manager,
 *   })
 * );
 */
@Injectable({ scope: Scope.TRANSIENT })
export class DeleteJournalCommand {
  /** Logger instance for this command */
  private readonly logger = new Logger(DeleteJournalCommand.name);
  /** Context containing command options and dependencies */
  private _context!: DeleteJournalCommandOptions;
  /** Loaded journal entity */
  private _journal: Journal;

  /**
   * Creates an instance of DeleteJournalCommand.
   * @param journalRepository - Repository for journal persistence
   */
  constructor(private readonly journalRepository: JournalRepository) {}

  /**
   * Gets the loaded journal entity.
   * @throws InternalServerErrorException if journal is not loaded
   */
  private get journal(): Journal {
    if (!this._journal)
      throw new InternalServerErrorException(
        `${this.assertJournalExists.name} is not initialized`,
      );
    return this._journal;
  }

  /**
   * Executes the delete journal command.
   * Loads the journal, checks access, archives the journal, and logs the process.
   * @param params - Options for deleting the journal
   * @throws NotFoundException if journal is not found
   * @throws ForbiddenException if user is not the owner
   */
  public async execute(params: DeleteJournalCommandOptions): Promise<void> {
    this.logger.log('starting delete journal command');
    this._context = params;

    await this.assertJournalExists();

    this.assertJournalAccessible();

    await this.archivingJournal();

    this.logger.log('finish delete journal command');
  }

  /**
   * Loads the journal from the database or throws if not found.
   * Sets the loaded journal to the private _journal property.
   * @throws NotFoundException if journal is not found
   */
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

  /**
   * Archives the journal entry in the database.
   * Uses the loaded journal and context payload.
   */
  private async archivingJournal(): Promise<void> {
    const {
      identifier: { id },
      entityManager,
    } = this._context;

    await this.journalRepository.archive({
      entity: { id: id },
      manager: entityManager,
    });
  }

  /**
   * Checks if the current user has access to delete the journal.
   * @throws ForbiddenException if the user is not the owner of the journal
   */
  private assertJournalAccessible(): void {
    const journalOwnerId = this.journal.userId;
    const requesterId = this._context.deleteBy.id;

    if (journalOwnerId !== requesterId)
      throw new ForbiddenException('Access denied');
  }
}
