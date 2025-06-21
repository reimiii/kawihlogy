import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  waitUntilObjectNotExists,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { EnvService } from '../env/env.service';
import { S3OperationParams } from './storage.type';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly storageBucketName: string;

  constructor(
    private readonly client: S3Client,
    private readonly env: EnvService,
  ) {
    this.storageBucketName = this.env.get('AWS_S3_BUCKET_NAME');
  }

  async save(opts: S3OperationParams) {
    const command = new PutObjectCommand({
      Bucket: this.storageBucketName,
      Body: opts.body,
      Key: opts.key,
      ContentType: opts.contentType,
    });

    await this.client.send(command);

    return {
      key: opts.key,
    };
  }

  async delete(opts: Pick<S3OperationParams, 'key'>) {
    const command = new DeleteObjectCommand({
      Bucket: this.storageBucketName,
      Key: opts.key,
    });

    await this.client.send(command);

    await waitUntilObjectNotExists(
      {
        client: this.client,
        maxWaitTime: 5000,
      },
      {
        Bucket: this.storageBucketName,
        Key: opts.key,
      },
    );
  }

  async findOne(opts: Pick<S3OperationParams, 'key'>): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.storageBucketName,
      Key: opts.key,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const url = await getSignedUrl(this.client, command, {
      expiresIn: 3600,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return url;
  }
}
