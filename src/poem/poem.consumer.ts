import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';
// import { HandleGeneratePoemAudioCommand } from './commands/handle-generate-poem-audio.command';
// import { HandleGeneratePoemCommand } from './commands/handle-generate-poem.command';
import { PoemJobName, PoemStrings } from './constants/poem-strings.constant';
import { PoemJobData } from './types/poem.type';
import { ModuleRef } from '@nestjs/core';

@Processor(PoemStrings.POEM_QUEUE, {
  concurrency: 5,
  lockDuration: 10 * 60 * 1000,
})
export class PoemConsumer extends WorkerHost {
  private readonly logger = new Logger(PoemConsumer.name);

  @Inject()
  private readonly moduleRef: ModuleRef;

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
        this.logger.debug(`Woops got text job with jobId: ${job.id}`);
        await this.handleText(job);
        break;
      }
      case 'audio': {
        this.logger.debug(`Chihuyy got audio job with jobId: ${job.id}`);
        await this.handleAudio(job);
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
        // const command = await this.moduleRef.resolve(HandleGeneratePoemCommand);
        // await command.execute({
        //   jobData: job.data,
        //   entityManager: tx,
        // });
      })
      .catch((err) => {
        this.logger.error(err);
        throw err;
      });
  }

  private async handleAudio(job: Job<PoemJobData, void, PoemJobName>) {
    this.logger.log(`Processing Audio Generation For JobId: ${job.id}`);
    await this.ds
      .transaction(async (tx) => {
        // const command = await this.moduleRef.resolve(
        //   HandleGeneratePoemAudioCommand,
        // );
        // await command.execute({
        //   jobData: job.data,
        //   entityManager: tx,
        // });
      })
      .catch((error) => {
        this.logger.error(error);
        throw error;
      });
  }
}
