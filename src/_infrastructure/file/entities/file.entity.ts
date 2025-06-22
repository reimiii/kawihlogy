import { AuditableEntity } from 'src/core/entities/auditable.entity';
import { Column, Entity } from 'typeorm';

@Entity('files')
export class File extends AuditableEntity {
  @Column({ type: 'varchar' })
  key: string; // S3 object key (path in bucket)

  url: string | null; // Public or signed URL

  @Column({ name: 'mime_type', type: 'varchar', length: 128, nullable: true })
  mimeType?: string; // e.g. image/jpeg, application/pdf

  @Column({
    type: 'int',
    nullable: true,
    unsigned: true,
    comment:
      'File size in bytes, null if not applicable (e.g. for external URLs)',
  })
  size?: number; // File size in bytes

  @Column({ type: 'varchar', nullable: true })
  originalName?: string; // Original file name if uploaded

  @Column({ type: 'boolean', default: true })
  isPublic: boolean; // Whether the file is public
}
