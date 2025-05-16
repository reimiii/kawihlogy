import { EntityManager } from 'typeorm';

export interface ArchiveOptions<
  Entity,
  RequiredKeys extends keyof Entity = never,
> {
  entity: Partial<Entity> & Pick<Entity, RequiredKeys>;
  manager?: EntityManager;
}
