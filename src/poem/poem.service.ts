import { Injectable, Logger } from '@nestjs/common';
import { PoemRepository } from './repositories/poem.repository';
import { DeletionOptions } from 'src/core/repositories/utils/archive.util';
import { Poem } from './entities/poem.entity';
import { FindOneOptionsBy } from 'src/core/repositories/utils/find-one.util';

@Injectable()
export class PoemService {
  private readonly logger = new Logger(PoemService.name);

  constructor(private readonly repo: PoemRepository) {}

  async findOne(params: FindOneOptionsBy<Poem, 'id' | 'journalId'>) {
    return await this.repo.findOneUnique(params);
  }

  async remove(params: DeletionOptions<Poem, 'id'>) {
    return await this.repo.erase(params);
  }

  async archive(params: DeletionOptions<Poem, 'id'>) {
    return await this.repo.archive(params);
  }

  async unArchive(params: DeletionOptions<Poem, 'id'>) {
    return await this.repo.unArchive(params);
  }
}
