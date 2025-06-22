import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { FileService } from './file.service';
import { FileRepository } from './repositories/file.repository';

@Module({
  imports: [StorageModule],
  providers: [FileService, FileRepository],
  exports: [FileService],
})
export class FileModule {}
