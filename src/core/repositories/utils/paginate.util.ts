import {
  EntityManager,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
} from 'typeorm';

export interface PaginateOptions<Entity> {
  page?: number;
  size?: number;
  where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[];
  order?: FindOptionsOrder<Entity>;
  relations?: FindOptionsRelations<Entity>;
  select?: FindOptionsSelect<Entity>;
  manager?: EntityManager;
}
