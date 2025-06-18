import { Readable } from 'node:stream';

export interface S3OperationParams {
  key: string; // S3 object key (e.g., file path in bucket)
  body?: string | Buffer | Readable; // File content for upload (optional for delete/list)
  contentType?: string; // MIME type for uploads (optional)
  metadata?: Record<string, string>; // Optional metadata for the object
}
