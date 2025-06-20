import { InjectQueue } from '@nestjs/bullmq';
import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { GeminiService } from 'src/_infrastructure/gemini/gemini.service';
import { jobId } from 'src/core/job-id.util';
import { DeletionOptions } from 'src/core/repositories/utils/archive.util';
import { FindOneOptionsBy } from 'src/core/repositories/utils/find-one.util';
import { JournalService } from 'src/journal/journal.service';
import { PoemJobName, PoemStrings } from './constants/poem-strings.constant';
import { Poem } from './entities/poem.entity';
import { PoemRepository } from './repositories/poem.repository';
import {
  PoemJobData,
  QueuePoemAudioTriggerOpts,
  QueuePoemTriggerOpts,
} from './types/poem.type';

@Injectable()
export class PoemService {
  private readonly logger = new Logger(PoemService.name);

  constructor(
    @InjectQueue(PoemStrings.POEM_QUEUE)
    private poemQueue: Queue<PoemJobData, void, PoemJobName>,
    private readonly journalService: JournalService,
    private readonly geminiService: GeminiService,
    private readonly repo: PoemRepository,
  ) {}

  /**
   * Triggers the poem generation queue for a specific journal entry.
   *
   * This method performs the following steps:
   * 1. Logs the trigger attempt for the given journal and user.
   * 2. Validates that the journal exists and belongs to the requesting user.
   * 3. Checks if a poem already exists for the journal (including soft-deleted poems).
   * 4. Counts the tokens in the journal content to ensure there is enough content to generate a poem.
   * 5. Checks if a job for the poem already exists in the queue and returns its status if so.
   * 6. Otherwise, adds a new poem generation job to the queue.
   *
   * @param options - Options for triggering the poem queue, including the journal identifier and the requesting user.
   * @throws {NotFoundException} If the journal does not exist.
   * @throws {ForbiddenException} If the user does not have access to the journal.
   * @throws {ConflictException} If a poem already exists for the journal.
   * @throws {NotAcceptableException} If the token count is unavailable.
   * @throws {UnprocessableEntityException} If there are not enough tokens to generate a poem.
   * @returns An object containing the HTTP status code and job information (job ID and state).
   */
  async triggerPoemTextQueue(options: QueuePoemTriggerOpts) {
    this.logger.log(
      `Triggering poem queue for journalId: ${options.identifier.journalId} by userId: ${options.by.id}`,
    );

    const journal = await this.journalService.findOne({
      by: { key: 'id', value: options.identifier.journalId },
    });

    if (!journal) {
      this.logger.warn(`Journal not found: ${options.identifier.journalId}`);
      throw new NotFoundException('Journal Not Found');
    }

    if (journal.userId !== options.by.id) {
      this.logger.warn(
        `Access denied for userId: ${options.by.id} on journalId: ${journal.id}`,
      );
      throw new ForbiddenException('Access Denied');
    }

    const poem = await this.findOne({
      by: { key: 'journalId', value: journal.id },
      withDeleted: true,
    });

    if (poem && !poem.deletedAt) {
      this.logger.warn(`Poem already exists for journalId: ${journal.id}`);
      throw new ConflictException('Poem Already Exist');
    }

    const token = await this.geminiService.countTokens(journal.content);

    if (!token) {
      this.logger.warn(`Token count unavailable for journalId: ${journal.id}`);
      throw new NotAcceptableException('Try again later');
    }

    if (token < 100) {
      this.logger.warn(
        `Not enough tokens (${token}) to generate poem for journalId: ${journal.id}`,
      );
      throw new UnprocessableEntityException(
        'Not enough tokens to generate poem, please fill the journal more. currently: ' +
          token,
      );
    }

    const identifier = jobId(
      PoemStrings.POEM_QUEUE,
      PoemStrings.JOBS.TEXT,
      journal.id,
    );

    const jobNow = await this.poemQueue.getJob(identifier);

    if (jobNow) {
      const state = await jobNow.getState(); // waiting / active / completed
      this.logger.log(
        `Job already exists for journalId: ${journal.id}, state: ${state}`,
      );
      return {
        statusCode: state === 'completed' ? HttpStatus.OK : HttpStatus.ACCEPTED,
        data: { jobId: jobNow.id, state },
      };
    }

    const jobNew = await this.poemQueue.add(
      PoemStrings.JOBS.TEXT,
      { identifier: journal.id, requestedBy: options.by },
      { jobId: identifier, removeOnComplete: 60 * 60, removeOnFail: 5 * 60 }, // 1 hour on complete, 5 minutes on fail
    );

    this.logger.log(
      `Added new poem job for journalId: ${journal.id}, jobId: ${jobNew.id}`,
    );

    return {
      statusCode: HttpStatus.ACCEPTED,
      data: { jobId: jobNew.id, state: 'added' },
    };
  }

  async triggerPoemAudioQueue(options: QueuePoemAudioTriggerOpts) {
    const poem = await this.findOne({
      by: { key: 'id', value: options.identifier.id },
      relations: { journal: true },
    });

    if (!poem) {
      this.logger.warn(`Poem not found: ${options.identifier.id}`);
      throw new NotFoundException('Poem Not Found');
    }

    if (poem.journal.userId !== options.by.id) {
      this.logger.warn(
        `Access denied for userId: ${options.by.id} on poemId: ${poem.id}`,
      );
      throw new ForbiddenException('Access Denied');
    }

    if (!poem.content) {
      this.logger.warn(`Poem content is empty for poemId: ${poem.id}`);
      throw new UnprocessableEntityException('Poem content is empty');
    }

    if (poem.fileId) {
      this.logger.warn(`Audio already exists for poemId: ${poem.id}`);
      throw new ConflictException('Audio Already Exist');
    }

    const identifier = jobId(
      PoemStrings.POEM_QUEUE,
      PoemStrings.JOBS.AUDIO,
      poem.id,
    );

    const jobNow = await this.poemQueue.getJob(identifier);

    if (jobNow) {
      const state = await jobNow.getState(); // waiting / active / completed
      this.logger.log(
        `Job already exists for poemId: ${poem.id}, state: ${state}`,
      );
      return {
        statusCode: state === 'completed' ? HttpStatus.OK : HttpStatus.ACCEPTED,
        data: { jobId: jobNow.id, state },
      };
    }

    const jobNew = await this.poemQueue.add(
      PoemStrings.JOBS.AUDIO,
      { identifier: poem.id, requestedBy: options.by },
      {
        jobId: identifier,
        removeOnComplete: true,
        removeOnFail: true,
        delay: 2000,
        // attempts: 3,
        // backoff: {
        //   type: 'exponential', // atau 'fixed'
        //   delay: 5000, // 5 detik antara retry
        // },
      }, // 1 hour on complete, 5 minutes on fail
    );

    this.logger.log(
      `Added new poem job for PoemId: ${poem.id}, jobId: ${jobNew.id}`,
    );

    return {
      statusCode: HttpStatus.ACCEPTED,
      data: { jobId: jobNew.id, state: 'added' },
    };
  }

  // --------------------
  // CRUD Operations
  // --------------------

  async findOne(params: FindOneOptionsBy<Poem, 'id' | 'journalId'>) {
    return await this.repo.findOneUnique(params);
  }

  async remove(params: DeletionOptions<Poem, 'id'>) {
    return await this.repo.erase(params);
  }

  async archive(params: DeletionOptions<Poem, 'id'>) {
    return await this.repo.archive(params);
  }

  async unArchive(params: DeletionOptions<Poem, 'id'>) {
    return await this.repo.unArchive(params);
  }
}
