import { Exclude, Expose, Type } from 'class-transformer';
import {
  PaginateMeta,
  PaginateResult,
} from 'src/core/repositories/types/paginate-result.type';
import { JournalResponseDto } from './journal-response.dto';
import { PickExcept } from 'src/core/types/option.types';

@Exclude()
export class JournalPaginateListResponse
  implements PaginateResult<PickExcept<JournalResponseDto, 'poem'>>
{
  @Expose()
  @Type(() => JournalResponseDto)
  items: PickExcept<JournalResponseDto, 'poem'>[];

  @Expose()
  meta: PaginateMeta;

  constructor(args: JournalPaginateListResponse) {
    Object.assign(this, args);
  }
}
