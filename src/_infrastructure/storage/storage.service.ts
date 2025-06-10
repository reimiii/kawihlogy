import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { EnvService } from '../env/env.service';
import { Readable } from 'stream';

interface S3OperationParams {
  key: string; // S3 object key (e.g., file path in bucket)
  body?: string | Buffer | Readable; // File content for upload (optional for delete/list)
  contentType?: string; // MIME type for uploads (optional)
  metadata?: Record<string, string>; // Optional metadata for the object
}

@Injectable()
export class StorageService {
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
  }
  delete() {}
  findOne() {}
}
