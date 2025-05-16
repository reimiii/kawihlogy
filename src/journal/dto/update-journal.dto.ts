import { z } from 'zod';
import { JournalDateStringSchema } from './create-journal.dto';

export const UpdateJournalSchema = z.object({
  content: z.string().min(10).max(5000).optional(),
  date: JournalDateStringSchema.optional(),
  isPrivate: z.boolean().optional(),
});

export type UpdateJournalDto = z.infer<typeof UpdateJournalSchema>;
