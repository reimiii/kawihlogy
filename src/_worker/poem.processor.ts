import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Job } from 'bullmq';
import {
  PoemStrings,
  PoemJobName,
} from 'src/poem/constants/poem-strings.constant';
import { PoemJobData } from 'src/poem/types/poem.type';
import { DataSource } from 'typeorm';
import { HandleGeneratePoemAudioCommand } from './commands/handle-generate-poem-audio.command';
import { HandleGeneratePoemCommand } from './commands/handle-generate-poem.command';

@Processor(PoemStrings.POEM_QUEUE, {
  concurrency: 1,
  lockDuration: 5 * 60 * 1000,
})
export class PoemProcessor extends WorkerHost {
  private readonly logger = new Logger(PoemProcessor.name);

  @Inject()
  private readonly moduleRef: ModuleRef;

  @Inject()
  private readonly ds: DataSource;

  /**
   * @method process
   * @description Main job processing method for the PoemQueue.
   * Dispatches jobs to specific handlers based on their `name`.
   * @param job The object containing data and name.
   * @param [token] An optional token (unused in this implementation).
   * @returns A promise that resolves when the job processing is complete.
   */
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

  /**
   * @method handleText
   * @description Handles 'text' type jobs, triggering the poem text generation process.
   * It runs the command within a database transaction.
   * @param job The object for text generation.
   * @returns A promise that resolves after the text generation command is executed.
   * @throws {Error} Throws any error encountered during the transaction or command execution.
   */
  private async handleText(job: Job<PoemJobData, void, PoemJobName>) {
    this.logger.log(`Processing text generation for job ${job.id}`);
    await this.ds
      .transaction(async (tx) => {
        const command = await this.moduleRef.resolve(HandleGeneratePoemCommand);
        await command.execute({
          jobData: job.data,
          entityManager: tx,
        });
      })
      .catch((err) => {
        this.logger.error(err);
        throw err;
      });
  }

  /**
   * @method handleAudio
   * @description Handles 'audio' type jobs, triggering the poem audio generation process.
   * It runs the command within a database transaction.
   * @param job The object for audio generation.
   * @returns A promise that resolves after the audio generation command is executed.
   * @throws {Error} Throws any error encountered during the transaction or command execution.
   */
  private async handleAudio(job: Job<PoemJobData, void, PoemJobName>) {
    this.logger.log(`Processing Audio Generation For JobId: ${job.id}`);
    await this.ds
      .transaction(async (tx) => {
        const command = await this.moduleRef.resolve(
          HandleGeneratePoemAudioCommand,
        );
        await command.execute({
          jobData: job.data,
          entityManager: tx,
        });
      })
      .catch((error) => {
        this.logger.error(error);
        throw error;
      });
  }
}
