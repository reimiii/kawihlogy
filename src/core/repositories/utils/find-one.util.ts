import {
  EntityManager,
  FindOneOptions,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
} from 'typeorm';

export interface FindByKey<K extends keyof any, V> {
  key: K;
  value: V;
}

export interface FindOneOptionsBy<Entity, Key extends keyof Entity> {
  by: FindByKey<Key, Entity[Key]>;
  where?: Omit<FindOptionsWhere<Entity>, Key>;
  select?: FindOptionsSelect<Entity>;
  relations?: FindOptionsRelations<Entity>;
  manager?: EntityManager;
  lock?: FindOneOptions<Entity>['lock'];
}
