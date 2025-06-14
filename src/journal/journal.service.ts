import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { FindOneOptionsBy } from 'src/core/repositories/utils/find-one.util';
import { DataSource } from 'typeorm';
import { CreateJournalCommand } from './commands/create-journal.command';
import { DeleteJournalCommand } from './commands/delete-journal.command';
import { UpdateJournalCommand } from './commands/update-journal.command';
import { JournalPaginationQueryDto } from './dto/journal-paginate-request.dto';
import { Journal } from './entities/journal.entity';
import { JournalRepository } from './repositories/journal.repository';
import {
  CreateJournalOptions,
  DeleteJournalOptions,
  FindOneJournalOptions,
  UpdateJournalOptions,
} from './types/journal.type';

@Injectable()
export class JournalService {
  private readonly logger = new Logger(JournalService.name);

  constructor(
    private readonly repo: JournalRepository,
    private readonly moduleRef: ModuleRef,
    private readonly ds: DataSource,
  ) {}

  async findOne(params: FindOneOptionsBy<Journal, 'id'>) {
    return await this.repo.findOneUnique(params);
  }

  /**
   * Creates a new journal entry in the system
   * @param params - The options for creating a journal
   * @param params.payload - The journal data to be created
   * @param params.createBy - The user creating the journal
   */
  async create(params: CreateJournalOptions): Promise<void> {
    this.logger.log('start: create journal');

    await this.ds.transaction(async (manager) => {
      const command = await this.moduleRef.resolve(CreateJournalCommand);
      await command.execute({
        payload: params.payload,
        createBy: params.createBy,
        entityManager: manager,
      });
    });

    this.logger.log('finish: create journal');
  }

  /**
   * Retrieves a paginated list of public journal entries
   * @param params - The pagination parameters
   * @param params.page - The page number to retrieve
   * @param params.size - The number of items per page
   * @param params.userId - Optional user ID to filter journals by
   * @returns Paginated list of journal entries with user information
   */
  async paginatePublic(params: JournalPaginationQueryDto) {
    this.logger.log('start: paginate journals');
    const res = await this.repo.paginate({
      page: params.page,
      size: params.size,
      relations: {
        user: true,
      },
      where: {
        ...(params.userId && { userId: params.userId }),
      },
      order: {
        createdAt: 'desc',
      },
      select: {
        user: {
          id: true,
          name: true,
          role: true,
        },
      },
    });

    this.logger.log('finish: paginate journals');
    return res;
  }

  /**
   * Retrieves a single journal entry by ID
   * @param params - The options for finding a journal
   * @param params.identifier - Contains the journal ID
   * @param params.accessBy - The user attempting to access the journal
   * @throws {NotFoundException} When journal is not found
   * @throws {ForbiddenException} When user tries to access a private journal they don't own
   * @returns The journal entry if found and accessible
   */
  async findOnePublic(params: FindOneJournalOptions): Promise<Journal> {
    this.logger.log('start: find journal');
    const res = await this.repo.findOneUnique({
      by: { key: 'id', value: params.identifier.id },
      relations: { user: true },
    });

    if (!res) throw new NotFoundException('Journal Not Found');

    if (res.isPrivate && res.userId !== params.accessBy.id)
      throw new ForbiddenException('Access Denied');

    this.logger.log('finish: find journal');
    return res;
  }

  /**
   * Updates an existing journal entry
   * @param params - The options for updating a journal
   * @param params.identifier - Contains the journal ID to update
   * @param params.payload - The updated journal data
   * @param params.updateBy - The user performing the update
   */
  async update(params: UpdateJournalOptions): Promise<void> {
    this.logger.log('start: update journal');

    await this.ds.transaction(async (manager) => {
      const command = await this.moduleRef.resolve(UpdateJournalCommand);
      await command.execute({
        identifier: params.identifier,
        payload: params.payload,
        updateBy: params.updateBy,
        entityManager: manager,
      });
    });

    this.logger.log('finish: update journal');
  }

  /**
   * Deletes a journal entry from the system
   * @param params - The options for deleting a journal
   * @param params.identifier - Contains the journal ID to delete
   * @param params.deleteBy - The user performing the deletion
   */
  async remove(params: DeleteJournalOptions): Promise<void> {
    this.logger.log('start: remove journal');

    await this.ds.transaction(async (manager) => {
      const command = await this.moduleRef.resolve(DeleteJournalCommand);

      await command.execute({
        identifier: params.identifier,
        deleteBy: params.deleteBy,
        entityManager: manager,
      });
    });

    this.logger.log('finish: remove journal');
  }
}
