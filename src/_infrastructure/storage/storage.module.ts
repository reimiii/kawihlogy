import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { S3StorageProvider } from './storage.provider';

@Module({
  providers: [StorageService, S3StorageProvider],
  exports: [StorageService],
})
export class StorageModule {}
