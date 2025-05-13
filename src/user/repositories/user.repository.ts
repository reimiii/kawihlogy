import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { FindOneOptionsBy } from 'src/core/repository/utils/find-one.util';
import { PaginateOptions } from 'src/core/repository/utils/paginate.util';
import { PaginateResult } from 'src/core/repository/types/paginate-result.type';
import { PersistOptions } from 'src/core/repository/utils/persist.util';

@Injectable()
export class UserRepository extends Repository<User> {
  private readonly logger = new Logger(UserRepository.name);

  constructor(
    @Inject(DataSource)
    readonly dataSourceOrEntity: DataSource | EntityManager,
  ) {
    const entityManager =
      dataSourceOrEntity instanceof DataSource
        ? dataSourceOrEntity.createEntityManager()
        : dataSourceOrEntity;

    super(User, entityManager);
  }

  public useManager(manager?: EntityManager): UserRepository {
    return manager ? new UserRepository(manager) : this;
  }

  public async findOneUnique(
    params: FindOneOptionsBy<User, 'id' | 'email'>,
  ): Promise<User | null> {
    this.logger.verbose('start', this.findOneUnique.name);

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

    this.logger.verbose('finish', this.findOneUnique.name);

    return result;
  }

  public async paginate(
    params: PaginateOptions<User>,
  ): Promise<PaginateResult<User>> {
    this.logger.verbose('start', this.paginate.name);

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

    this.logger.verbose('finish', this.paginate.name);

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

  public async persist<RequiredKeys extends keyof User = never>(
    params: PersistOptions<User, RequiredKeys>,
  ): Promise<User> {
    this.logger.verbose('start', this.persist.name);

    const repo = this.useManager(params.manager);
    const entity = repo.create(params.entity);
    const result = await repo.save(entity);

    this.logger.verbose('finish', this.persist.name);
    return result;
  }
}
