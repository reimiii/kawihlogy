import {
  OnQueueEvent,
  QueueEventsHost,
  QueueEventsListener,
} from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { PoemStrings } from './constants/poem-strings.constant';
import { PoemGateway } from './poem.gateway';

@QueueEventsListener(PoemStrings.POEM_QUEUE)
export class PoemEventsListener extends QueueEventsHost {
  private readonly logger = new Logger(PoemEventsListener.name);

  @Inject()
  private readonly gateway: PoemGateway;

  @OnQueueEvent('added')
  onAdded(args: { jobId: string; name: string }, id: string) {
    this.logger.log('On Queue Event: Job Added', 'PoemEventsListener.onAdded');
    this.logger.log(
      `Job ${args.jobId} with name ${args.name} added to the queue.`,
      'PoemEventsListener.onAdded',
    );
    this.logger.log(`Job ID: ${id}`, 'PoemEventsListener.onAdded');
    this.gateway.namespace.to(args.jobId).emit('job:added', {
      type: 'added',
    });
  }

  @OnQueueEvent('active')
  onActive(job: { jobId: string; prev?: string }) {
    this.logger.log(
      'On Queue Event: Job Active',
      'PoemEventsListener.onActive',
    );
    this.logger.log(
      `Processing job ${job.jobId}...`,
      'PoemEventsListener.onActive',
    );

    this.gateway.namespace.to(job.jobId).emit('job:active', {
      type: 'active',
    });
  }

  @OnQueueEvent('waiting')
  onWaiting(args: { jobId: string; prev?: string }, id: string) {
    this.logger.log(
      'On Queue Event: Job Waiting',
      'PoemEventsListener.onWaiting',
    );
    this.logger.log(
      `Job ${args.jobId} is waiting in the queue.`,
      'PoemEventsListener.onWaiting',
    );
    this.logger.log(`Job ID: ${id}`, 'PoemEventsListener.onWaiting');
    this.logger.log(
      `Previous state: ${args.prev}`,
      'PoemEventsListener.onWaiting',
    );

    this.gateway.namespace.to(args.jobId).emit('job:waiting', {
      type: 'waiting',
    });
  }

  @OnQueueEvent('error')
  onError(error: Error) {
    this.logger.error('On Queue Event: Error', 'PoemEventsListener.onError');
    this.logger.error(
      `An error occurred: ${error.message}`,
      'PoemEventsListener.onError',
    );
    this.logger.error(
      `Stack trace: ${error.stack}`,
      'PoemEventsListener.onError',
    );
  }

  @OnQueueEvent('failed')
  onFailed(
    args: { failedReason: string; jobId: string; prev?: string },
    id: string,
  ) {
    this.logger.error(
      'On Queue Event: Job Failed',
      'PoemEventsListener.onFailed',
    );
    this.logger.error(
      `Job ${args.jobId} failed with reason: ${args.failedReason}`,
      'PoemEventsListener.onFailed',
    );
    this.logger.log(`Job ID: ${id}`, 'PoemEventsListener.onFailed');
    this.logger.log(
      `Previous state: ${args.prev}`,
      'PoemEventsListener.onFailed',
    );
    this.gateway.namespace.to(args.jobId).emit('job:failed', {
      type: 'failed',
      reason: args.failedReason,
    });
  }

  @OnQueueEvent('completed')
  onCompleted(
    args: { jobId: string; prev?: string; returnvalue: string },
    id: string,
  ) {
    this.logger.log(
      'On Queue Event: Job Completed',
      'PoemEventsListener.onCompleted',
    );
    this.logger.log(
      `Job ${args.jobId} completed successfully.`,
      'PoemEventsListener.onCompleted',
    );
    this.logger.log(
      `Return value: ${args.returnvalue}`,
      'PoemEventsListener.onCompleted',
    );
    this.logger.log(`Job ID: ${id}`, 'PoemEventsListener.onCompleted');
    this.logger.log(
      `Previous state: ${args.prev}`,
      'PoemEventsListener.onCompleted',
    );
    this.gateway.namespace.to(args.jobId).emit('job:completed', {
      type: 'completed',
    });
  }
}
