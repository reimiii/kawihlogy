import {
  ArgumentMetadata,
  BadRequestException,
  HttpStatus,
  PipeTransform,
} from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform<unknown, unknown> {
  constructor(private readonly schemas: ZodSchema) {}
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    const { type } = metadata;
    const parsed = this.schemas.safeParse(value);

    if (parsed.success) return parsed.data;

    const format = parsed.error.flatten();
    const payload = {
      statusCode: HttpStatus.BAD_REQUEST,
      type: type,
      message: 'validation errors',
      errors: format,
    };

    throw new BadRequestException(payload);
  }
}
