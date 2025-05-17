import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { JournalRepository } from '../repositories/journal.repository';
import { CreateJournalCommandOptions } from '../types/journal.type';

/**
 * Command class responsible for creating a journal entry.
 *
 * This class handles the process of loading the user, validating their existence,
 * and persisting a new journal entry to the database. It uses dependency injection
 * for the user service and journal repository, and logs the execution process.
 *
 * @remarks
 * - Throws {@link NotFoundException} if the user is not found.
 * - Throws {@link InternalServerErrorException} if the user is not loaded before use.
 *
 * @example
 * // Usage in a NestJS service with ModuleRef:
 * await this.moduleRef.resolve(CreateJournalCommand).then(command =>
 *   command.execute({
 *     payload: { content: 'My entry', date: new Date(), isPrivate: false },
 *     createBy: user,
 *     entityManager: manager,
 *   })
 * );
 */
@Injectable({ scope: Scope.TRANSIENT })
export class CreateJournalCommand {
  /** Logger instance for this command */
  private readonly logger = new Logger(CreateJournalCommand.name);
  /** Context containing command options and dependencies */
  private _context!: CreateJournalCommandOptions;
  /** Loaded user entity */
  private _user: User;

  /**
   * Creates an instance of CreateJournalCommand.
   * @param userService - Service for user-related operations
   * @param journalRepository - Repository for journal persistence
   */
  constructor(
    private readonly userService: UserService,
    private readonly journalRepository: JournalRepository,
  ) {}

  /**
   * Gets the loaded user entity.
   * @throws InternalServerErrorException if user is not loaded
   */
  private get user(): User {
    if (!this._user)
      throw new InternalServerErrorException(
        `${this.loadUserOrFail.name} is not initialized`,
      );
    return this._user;
  }

  /**
   * Executes the create journal command.
   * Loads the user, persists the journal, and logs the process.
   * @param params - Options for creating the journal
   * @throws NotFoundException if user is not found
   */
  public async execute(params: CreateJournalCommandOptions): Promise<void> {
    this.logger.log('starting create journal command');
    this._context = params;

    await this.loadUserOrFail();

    await this.persistJournal();

    this.logger.log('finish create journal command');
  }

  /**
   * Loads the user from the database or throws if not found.
   * Sets the loaded user to the private _user property.
   * @throws NotFoundException if user is not found
   */
  private async loadUserOrFail(): Promise<void> {
    const {
      createBy: { id },
      entityManager,
    } = this._context;

    const data = await this.userService.findOne({
      by: { key: 'id', value: id },
      manager: entityManager,
    });

    if (!data) throw new NotFoundException('User Not Found');

    this._user = data;
  }

  /**
   * Persists the journal entry to the database.
   * Uses the loaded user and context payload.
   */
  private async persistJournal(): Promise<void> {
    const {
      payload: { content, date, isPrivate },
      entityManager,
    } = this._context;

    await this.journalRepository.persist({
      entity: {
        userId: this.user.id,
        content: content,
        date: date,
        isPrivate: isPrivate,
      },
      manager: entityManager,
    });
  }
}
