import { Exclude, Expose, Type } from 'class-transformer';
import { PoemContentPayload } from '../types/poem.type';
import { FileResponseDto } from 'src/_infrastructure/file/dto/file-response.dto';

@Exclude()
export class PoemResponseDto {
  @Expose()
  id: string;

  @Expose()
  content: PoemContentPayload;

  @Expose()
  @Type(() => FileResponseDto)
  file: FileResponseDto;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(args: PoemResponseDto) {
    Object.assign(this, args);
  }
}
