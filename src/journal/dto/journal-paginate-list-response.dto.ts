import { Exclude, Expose, Type } from 'class-transformer';
import {
  PaginateMeta,
  PaginateResult,
} from 'src/core/repositories/types/paginate-result.type';
import { JournalResponseDto } from './journal-response.dto';

@Exclude()
export class JournalPaginateListResponse
  implements PaginateResult<JournalResponseDto>
{
  @Expose()
  @Type(() => JournalResponseDto)
  items: JournalResponseDto[];

  @Expose()
  meta: PaginateMeta;

  constructor(args: JournalPaginateListResponse) {
    Object.assign(this, args);
  }
}
