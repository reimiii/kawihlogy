import { Inject, Injectable, Logger } from '@nestjs/common';
import { PaginateResult } from 'src/core/repositories/types/paginate-result.type';
import { FindOneOptionsBy } from 'src/core/repositories/utils/find-one.util';
import { PaginateOptions } from 'src/core/repositories/utils/paginate.util';
import { PersistOptions } from 'src/core/repositories/utils/persist.util';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Journal } from '../entities/journal.entity';
import { ArchiveOptions } from 'src/core/repositories/utils/archive.util';

@Injectable()
export class JournalRepository extends Repository<Journal> {
  private readonly logger = new Logger(JournalRepository.name);

  constructor(
    @Inject(DataSource)
    readonly dataSourceOrEntity: DataSource | EntityManager,
  ) {
    const entityManager =
      dataSourceOrEntity instanceof DataSource
        ? dataSourceOrEntity.createEntityManager()
        : dataSourceOrEntity;

    super(Journal, entityManager);
  }

  public useManager(manager?: EntityManager): JournalRepository {
    return manager ? new JournalRepository(manager) : this;
  }

  public async findOneUnique(
    params: FindOneOptionsBy<Journal, 'id'>,
  ): Promise<Journal | null> {
    this.logger.log('start find one unique from repository');

    const repo = this.useManager(params.manager);

    const result = await repo.findOne({
      where: {
        [params.by.key]: params.by.value,
        ...(params.where || {}),
      },
      select: params.select,
      relations: params.relations,
      lock: params.lock,
    });

    this.logger.log('finish find one unique from repository');

    return result;
  }

  public async paginate(
    params: PaginateOptions<Journal>,
  ): Promise<PaginateResult<Journal>> {
    this.logger.log('start paginate from repository');

    const repo = this.useManager(params.manager);

    const page = Math.max(1, params.page || 1);
    const size = Math.max(1, params.size || 10);

    const [items, total] = await repo.findAndCount({
      where: params.where,
      order: params.order,
      relations: params.relations,
      select: params.select,
      take: size,
      skip: (page - 1) * size,
    });

    const lastPage = Math.max(1, Math.ceil(total / size));
    const hasNext = page < lastPage;
    const hasPrev = page > 1;

    this.logger.log('finish paginate from repository');

    return {
      items: items,
      meta: {
        total: total,
        page: page,
        size: size,
        lastPage: lastPage,
        hasNext: hasNext,
        hasPrev: hasPrev,
      },
    };
  }

  public async persist<RequiredKeys extends keyof Journal = never>(
    params: PersistOptions<Journal, RequiredKeys>,
  ): Promise<Journal> {
    this.logger.log('start persist from repository');

    const repo = this.useManager(params.manager);
    const entity = repo.create(params.entity);
    const result = await repo.save(entity);

    this.logger.log('finish persist from repository');

    return result;
  }

  public async archive(params: ArchiveOptions<Journal, 'id'>) {
    this.logger.log('start archiving from repository');

    const e = params.entity;
    const repo = this.useManager(params.manager);
    const result = await repo.softRemove(e);

    this.logger.log('finish archiving repository');

    return result;
  }
}
