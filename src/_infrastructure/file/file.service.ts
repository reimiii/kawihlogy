import { Injectable } from '@nestjs/common';
import { DeletionOptions } from 'src/core/repositories/utils/archive.util';
import { FindOneOptionsBy } from 'src/core/repositories/utils/find-one.util';
import { PaginateOptions } from 'src/core/repositories/utils/paginate.util';
import { PersistOptions } from 'src/core/repositories/utils/persist.util';
import { File } from './entities/file.entity';
import { FileRepository } from './repositories/file.repository';
import { S3OperationParams } from '../storage/storage.type';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class FileService {
  constructor(
    private readonly repo: FileRepository,
    private readonly storageService: StorageService,
  ) {}

  async findOne(params: FindOneOptionsBy<File, 'id'>) {
    return await this.repo.findOneUnique(params);
  }

  async paginate(params: PaginateOptions<File>) {
    return await this.repo.paginate(params);
  }

  async save<K extends keyof File>(
    params: PersistOptions<File, K>,
    storage: Pick<S3OperationParams, 'body'>,
  ) {
    await this.storageService.save({
      key: params.entity.key!,
      body: storage.body,
      contentType: params.entity.mimeType,
    });

    return await this.repo.persist(params).catch(async (error) => {
      const k = params.entity.key!;
      await this.storageService.delete({ key: k });
      throw error;
    });
  }

  async delete(params: DeletionOptions<File, 'id' | 'key'>) {
    const res = await this.repo.erase(params);
    await this.storageService.delete({
      key: params.entity.key,
    });

    return res;
  }
}
