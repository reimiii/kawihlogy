import { Injectable } from '@nestjs/common';
import { DeletionOptions } from 'src/core/repositories/utils/archive.util';
import { FindOneOptionsBy } from 'src/core/repositories/utils/find-one.util';
import { PaginateOptions } from 'src/core/repositories/utils/paginate.util';
import { PersistOptions } from 'src/core/repositories/utils/persist.util';
import { File } from './entities/file.entity';
import { FileRepository } from './repositories/file.repository';

@Injectable()
export class FileService {
  constructor(private readonly repo: FileRepository) {}

  async findOne(params: FindOneOptionsBy<File, 'id'>) {
    return await this.repo.findOneUnique(params);
  }

  async paginate(params: PaginateOptions<File>) {
    return await this.repo.paginate(params);
  }

  async save<K extends keyof File>(params: PersistOptions<File, K>) {
    return await this.repo.persist(params);
  }

  async delete(params: DeletionOptions<File, 'id'>) {
    return await this.repo.erase(params);
  }
}
