import { PaginationQuerySchema } from 'src/core/dto/pagination-query.dto';
import { z } from 'zod';

export const JournalPaginationQuerySchema = PaginationQuerySchema.extend({
  userId: z.string().uuid().optional(),
});

export type JournalPaginationQueryDto = z.infer<
  typeof JournalPaginationQuerySchema
>;
