import { Exclude, Expose, Type } from 'class-transformer';
import { UserMinimalDto } from 'src/user/dto/user-minimal.dto';
import { Journal } from '../entities/journal.entity';

@Exclude()
export class JournalResponseDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  date: Date;

  @Expose()
  isPrivate: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => UserMinimalDto)
  user: UserMinimalDto;

  constructor(journal: Partial<Journal>) {
    Object.assign(this, journal);
  }
}
