import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';
import { HandleGeneratePoemCommand } from './commands/handle-generate-poem.command';
import { PoemJobName, PoemStrings } from './constants/poem-strings.constant';
import { PoemJobData } from './types/poem.type';

@Processor(PoemStrings.POEM_QUEUE, {
  concurrency: 5,
})
export class PoemConsumer extends WorkerHost {
  private readonly logger = new Logger(PoemConsumer.name);

  @Inject()
  private readonly handlerGenerateText: HandleGeneratePoemCommand;

  @Inject()
  private readonly ds: DataSource;

  async process(
    job: Job<PoemJobData, void, PoemJobName>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token?: string,
  ): Promise<void> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'text': {
        await this.handleText(job);
        break;
      }
      case 'audio': {
        this.logger.debug(
          `Audio job ${job.id} is not implemented yet, skipping processing.`,
        );
        break;
      }
      default:
        job.name satisfies never;
    }
  }

  private async handleText(job: Job<PoemJobData, void, PoemJobName>) {
    this.logger.log(`Processing text generation for job ${job.id}`);
    await this.ds
      .transaction(async (tx) => {
        await this.handlerGenerateText.execute({
          jobData: job.data,
          entityManager: tx,
        });
      })
      .catch((err) => {
        throw err;
      });
  }
}
