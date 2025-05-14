import { Role } from 'src/auth/enums/role.enum';
import { BaseEntity } from 'src/core/entities/base.entity';
import { Journal } from 'src/journal/entities/journal.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.Echo })
  role: Role;

  @OneToMany(() => Journal, (journal) => journal.user)
  journals: Journal[];
}
