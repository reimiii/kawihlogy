import { BaseEntity } from 'src/core/entities/base.entity';
import { Journal } from 'src/journal/entities/journal.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { PoemContentPayload } from '../types/poem.type';

@Entity('poems')
export class Poem extends BaseEntity {
  @Column({ name: 'journal_id', type: 'uuid', unique: true })
  journalId: string;

  @OneToOne(() => Journal, (journal) => journal.poem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'journal_id' })
  journal: Journal;

  @Column({ type: 'json' })
  content: PoemContentPayload;
}
