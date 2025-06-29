import { Inject, Injectable, Logger } from '@nestjs/common';
import { PaginateResult } from 'src/core/repositories/types/paginate-result.type';
import { DeletionOptions } from 'src/core/repositories/utils/archive.util';
import { FindOneOptionsBy } from 'src/core/repositories/utils/find-one.util';
import { PaginateOptions } from 'src/core/repositories/utils/paginate.util';
import { PersistOptions } from 'src/core/repositories/utils/persist.util';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { File } from '../entities/file.entity';

/**
 * Repository for managing File entities with custom methods for pagination, persistence, and archiving.
 * Extends the TypeORM Repository for File.
 */
@Injectable()
export class FileRepository extends Repository<File> {
  /** Logger instance for FileRepository */
  private readonly logger = new Logger(FileRepository.name);

  /**
   * Constructs a new FileRepository instance.
   * @param dataSourceOrEntity - The DataSource or EntityManager to use for database operations.
   */
  constructor(
    @Inject(DataSource)
    readonly dataSourceOrEntity: DataSource | EntityManager,
  ) {
    const entityManager =
      dataSourceOrEntity instanceof DataSource
        ? dataSourceOrEntity.createEntityManager()
        : dataSourceOrEntity;

    super(File, entityManager);
  }

  /**
   * Returns a new FileRepository instance using the provided EntityManager, or the current instance if none is provided.
   * @param manager - Optional EntityManager to use.
   * @returns FileRepository instance with the specified manager.
   */
  public useManager(manager?: EntityManager): FileRepository {
    return manager ? new FileRepository(manager) : this;
  }

  /**
   * Finds a unique File entity by a specific key and value, with optional additional query options.
   * @param params - Options for finding the entity, including key, value, and additional query options.
   * @returns The found File entity or null if not found.
   */
  public async findOneUnique(
    params: FindOneOptionsBy<File, 'id'>,
  ): Promise<File | null> {
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
      withDeleted: params.withDeleted,
    });

    this.logger.log('finish find one unique from repository');

    return result;
  }

  /**
   * Paginates File entities based on the provided options.
   *
   * @param params - Pagination options object:
   *   - `page` (number): Page number to retrieve (default: 1).
   *   - `size` (number): Number of items per page (default: 10).
   *   - `where` (FindOptionsWhere<File>): Filter conditions for the query (e.g., `{ userId: 1 }`).
   *   - `order` (FindOptionsOrder<File>): Sorting order for the results (e.g., `{ createdAt: 'DESC' }`).
   *   - `relations` (string[]): Relations to load with each File entity (e.g., `["user"]`).
   *   - `select` (FindOptionsSelect<File>): Fields to select in the result (e.g., `{ id: true, title: true }`).
   *   - `manager` (EntityManager): Optional custom EntityManager for advanced use cases.
   * @returns PaginateResult containing items and pagination metadata (total, page, size, lastPage, hasNext, hasPrev).
   */
  public async paginate(
    params: PaginateOptions<File>,
  ): Promise<PaginateResult<File>> {
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

  /**
   * Persists (creates or updates) a File entity in the database.
   * @param params - Persistence options including the entity data and optional manager.
   * @returns The persisted File entity.
   */
  public async persist<RequiredKeys extends keyof File = never>(
    params: PersistOptions<File, RequiredKeys>,
  ): Promise<File> {
    this.logger.log('start persist from repository');

    const repo = this.useManager(params.manager);
    const entity = repo.create(params.entity);
    const result = await repo.save(entity);

    this.logger.log('finish persist from repository');

    return result;
  }

  /**
   * Archives (soft removes) a File entity from the database.
   * @param params - Archive options including the entity to archive and optional manager.
   * @returns The archived File entity.
   */
  public async archive(params: DeletionOptions<File, 'id'>): Promise<File> {
    this.logger.log('start archiving from repository');

    const e = params.entity;
    const repo = this.useManager(params.manager);
    const result = await repo.softRemove(e);

    this.logger.log('finish archiving repository');

    return result;
  }

  public async unArchive(params: DeletionOptions<File, 'id'>): Promise<File> {
    this.logger.log('start recovering from repository');

    const e = params.entity;
    const repo = this.useManager(params.manager);
    const result = await repo.recover(e);

    this.logger.log('finish recovering repository');

    return result;
  }

  public async erase(params: DeletionOptions<File, 'id'>): Promise<File> {
    this.logger.log('start destroying from repository');

    const repo = this.useManager(params.manager);
    const e = repo.create(params.entity);
    const result = await repo.remove(e);

    this.logger.log('finish destroying repository');

    return result;
  }
}
