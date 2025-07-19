import { z } from 'zod';
import { JournalDateStringSchema } from './create-journal.dto';

export const UpdateJournalSchema = z.object({
  content: z.string().min(10).max(5000).optional(),
  date: JournalDateStringSchema.optional(),
  isPrivate: z.boolean().optional(),
  title: z.string().min(10).max(255).optional(),
  emotions: z
    .array(z.string().min(1, { message: 'This field cannot be empty' }).max(70))
    .min(1, { message: 'At least one emotion is required' })
    .optional(),
  topics: z
    .array(z.string().min(1, { message: 'This field cannot be empty' }).max(70))
    .min(1, { message: 'At least one topic is required' })
    .optional(),
});

export type UpdateJournalDto = z.infer<typeof UpdateJournalSchema>;
