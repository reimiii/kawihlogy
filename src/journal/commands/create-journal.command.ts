import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { JournalRepository } from '../repositories/user.repository';
import { CreateJournalCommandOptions } from '../types/journal.type';

@Injectable({ scope: Scope.TRANSIENT })
export class CreateJournalCommand {
  private readonly logger = new Logger(CreateJournalCommand.name);
  private _context!: CreateJournalCommandOptions;
  private _user: User;

  constructor(
    private readonly userService: UserService,
    private readonly journalRepository: JournalRepository,
  ) {}

  private get user(): User {
    if (!this._user)
      throw new InternalServerErrorException(
        `${this.loadUserOrFail.name} is not initialized`,
      );
    return this._user;
  }

  public async execute(params: CreateJournalCommandOptions): Promise<void> {
    this.logger.log('starting create journal command');
    this._context = params;

    await this.loadUserOrFail();

    await this.persistJournal();

    this.logger.log('finish create journal command');
  }

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
