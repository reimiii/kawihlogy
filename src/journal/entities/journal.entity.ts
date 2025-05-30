import { BaseEntity } from 'src/core/entities/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('journals')
export class Journal extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.journals)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    default: 'Untitled Journal',
  })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 70, array: true })
  emotions: string[];

  @Column({ type: 'varchar', length: 70, array: true })
  topics: string[];

  @Column({ type: 'date' })
  date: Date;

  @Column({ name: 'is_private', type: 'boolean', default: false })
  isPrivate: boolean;
}
