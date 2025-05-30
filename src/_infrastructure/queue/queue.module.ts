import { BullModule as BM } from '@nestjs/bullmq';
import { EnvService } from '../env/env.service';
import { QueueOptions } from 'bullmq';

export const BullModule = BM.forRootAsync({
  inject: [EnvService],
  useFactory: (envService: EnvService): QueueOptions => {
    const host = envService.get('REDIS_HOST');
    const port = envService.get('REDIS_PORT');
    const serviceName = envService.get('SERVICE_NAME');
    return {
      prefix: serviceName,
      connection: {
        host: host,
        port: port,
      },
    };
  },
});
