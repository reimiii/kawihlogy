import { EntityManager } from 'typeorm';

export interface DeletionOptions<
  Entity,
  RequiredKeys extends keyof Entity = never,
> {
  entity: Pick<Entity, RequiredKeys> & Partial<Entity>;
  manager?: EntityManager;
}
