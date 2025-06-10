import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { FileRepository } from './repositories/file.repository';

@Module({
  controllers: [FileController],
  providers: [FileService, FileRepository],
  exports: [FileService],
})
export class FileModule {}
