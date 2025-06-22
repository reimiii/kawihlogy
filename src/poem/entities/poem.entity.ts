import { BaseEntity } from 'src/core/entities/base.entity';
import { Journal } from 'src/journal/entities/journal.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { PoemContentPayload } from '../types/poem.type';
import { File } from 'src/_infrastructure/file/entities/file.entity';

@Entity('poems')
export class Poem extends BaseEntity {
  @Column({ name: 'journal_id', type: 'uuid', unique: true })
  journalId: string;

  @OneToOne(() => Journal, (journal) => journal.poem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'journal_id' })
  journal: Journal;

  @Column({ name: 'file_id', type: 'uuid', nullable: true })
  fileId: string | null;

  @OneToOne(() => File, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'file_id' })
  file: File | null;

  @Column({ type: 'json' })
  content: PoemContentPayload;
}
