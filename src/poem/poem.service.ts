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
import { PoemGateway } from './poem.gateway';
import { PoemRepository } from './repositories/poem.repository';
import { PoemJobData, QueuePoemTriggerOpts } from './types/poem.type';

@Injectable()
export class PoemService {
  private readonly logger = new Logger(PoemService.name);

  constructor(
    @InjectQueue(PoemStrings.POEM_QUEUE)
    private poemQueue: Queue<PoemJobData, void, PoemJobName>,
    private readonly journalService: JournalService,
    private readonly geminiService: GeminiService,
    private readonly repo: PoemRepository,
    private readonly gateway: PoemGateway,
  ) {}

  async triggerPoemQueue(options: QueuePoemTriggerOpts) {
    const journal = await this.journalService.findOne({
      by: { key: 'id', value: options.identifier.journalId },
    });

    if (!journal) throw new NotFoundException('Journal Not Found');

    if (journal.userId !== options.by.id)
      throw new ForbiddenException('Access Denied');

    const poem = await this.findOne({
      by: { key: 'journalId', value: journal.id },
      withDeleted: true,
    });

    if (poem && !poem.deletedAt)
      throw new ConflictException('Poem Already Exist');

    const token = await this.geminiService.countTokens(journal.content);

    // try again if token is not available
    if (!token) throw new NotAcceptableException('Try again later');

    // for now, we need at least 200 tokens to generate a poem
    if (token < 200)
      throw new UnprocessableEntityException(
        'Not enough tokens to generate poem, please fill the journal more. currently: ' +
          token,
      );

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
