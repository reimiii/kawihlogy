import { z } from 'zod';
import { JournalDateStringSchema } from './create-journal.dto';

export const UpdateJournalSchema = z.object({
  content: z.string().min(10).max(5000).optional(),
  date: JournalDateStringSchema.optional(),
  isPrivate: z.boolean().optional(),
  title: z.string().max(255).optional(),
  emotions: z.array(z.string().max(70)).min(1).optional(),
  topics: z.array(z.string().max(70)).min(1).optional(),
});

export type UpdateJournalDto = z.infer<typeof UpdateJournalSchema>;
