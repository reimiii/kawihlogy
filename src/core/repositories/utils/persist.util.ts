import { EntityManager } from 'typeorm';

export interface PersistOptions<
  Entity,
  RequiredKeys extends keyof Entity = never,
> {
  entity: Partial<Entity> & Pick<Entity, RequiredKeys>;
  manager?: EntityManager;
}
