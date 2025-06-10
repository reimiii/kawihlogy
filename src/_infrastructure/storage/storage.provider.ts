import { S3Client } from '@aws-sdk/client-s3';
import { Provider } from '@nestjs/common';
import { EnvService } from '../env/env.service';

export const S3StorageProvider: Provider<S3Client> = {
  provide: S3Client,
  useFactory: (env: EnvService) => {
    const s3Client = new S3Client({
      region: env.get('AWS_REGION'),
      credentials: {
        accessKeyId: env.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: env.get('AWS_SECRET_ACCESS_KEY'),
      },
    });

    return s3Client;
  },
  inject: [EnvService],
};
