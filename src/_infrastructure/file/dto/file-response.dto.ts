import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class FileResponseDto {
  @Expose()
  id: string;

  @Expose()
  key: string; // S3 object key (path in bucket)

  @Expose()
  url: string | null;

  @Expose()
  mimeType: string | null; // e.g. image/jpeg, application/pdf

  @Expose()
  size?: number; // File size in bytes

  @Expose()
  originalName: string | null; // Original file name if uploaded

  constructor(args: Partial<FileResponseDto>) {
    Object.assign(this, args);
  }
}
