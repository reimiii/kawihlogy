import { InjectQueue } from '@nestjs/bullmq';
import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Queue } from 'bullmq';
import { jobId } from 'src/core/job-id.util';
import { FindOneOptionsBy } from 'src/core/repositories/utils/find-one.util';
import {
  PoemJobName,
  PoemStrings,
} from 'src/poem/constants/poem-strings.constant';
import { PoemService } from 'src/poem/poem.service';
import { PoemJobData } from 'src/poem/types/poem.type';
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
  QueuePoemTriggerOpts,
  UpdateJournalOptions,
} from './types/journal.type';

@Injectable()
export class JournalService {
  private readonly logger = new Logger(JournalService.name);

  constructor(
    @InjectQueue(PoemStrings.POEM_QUEUE)
    private poemQueue: Queue<PoemJobData, void, PoemJobName>,
    private readonly repo: JournalRepository,
    private readonly moduleRef: ModuleRef,
    private readonly ds: DataSource,
    private readonly poemService: PoemService,
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

  async triggerPoemQueue(options: QueuePoemTriggerOpts) {
    const journal = await this.repo.findOneUnique({
      by: { key: 'id', value: options.identifier.id },
    });

    if (!journal) throw new NotFoundException('Journal Not Found');

    if (journal.userId !== options.by.id)
      throw new ForbiddenException('Access Denied');

    const poem = await this.poemService.findOne({
      by: { key: 'journalId', value: journal.id },
      withDeleted: true,
    });

    if (poem && !poem.deletedAt)
      throw new ConflictException('Poem Already Exist');

    const identifier = jobId(
      PoemStrings.POEM_QUEUE,
      PoemStrings.JOBS.TEXT,
      journal.id,
    );

    const jobNow = await this.poemQueue.getJob(identifier);

    if (jobNow) {
      const state = await jobNow.getState(); // waiting / active / completed
      return {
        statusCode: state === 'completed' ? HttpStatus.OK : HttpStatus.ACCEPTED,
        data: { jobId: jobNow.id, state },
      };
    }

    const jobNew = await this.poemQueue.add(
      PoemStrings.JOBS.TEXT,
      { journalId: journal.id, requestedBy: options.by },
      { jobId: identifier, removeOnComplete: true },
    );

    return {
      statusCode: HttpStatus.ACCEPTED,
      data: { jobId: jobNew.id, state: 'waiting' },
    };
  }
}
