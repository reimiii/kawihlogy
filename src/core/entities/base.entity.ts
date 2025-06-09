import { DeleteDateColumn } from 'typeorm';
import { AuditableEntity } from './auditable.entity';

export abstract class BaseEntity extends AuditableEntity {
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
