import { Processor, WorkerHost } from '@nestjs/bullmq';
import { PoemJobName, PoemStrings } from './constants/poem-strings.constant';
import { Job } from 'bullmq';
import { setTimeout } from 'node:timers/promises';
import { PoemJobData } from './types/poem.type';

@Processor(PoemStrings.POEM_QUEUE)
export class PoemConsumer extends WorkerHost {
  async process(
    job: Job<PoemJobData, void, PoemJobName>,
    token?: string,
  ): Promise<void> {
    await setTimeout(1000);

    switch (job.name) {
      case 'text': {
        console.log('this is text');
        console.info(job.data);
        console.info(job.id);
        console.info('token', token);
        break;
      }
      case 'audio': {
        console.log('audioss');
        break;
      }
      default:
        job.name satisfies never;
    }
  }
}
