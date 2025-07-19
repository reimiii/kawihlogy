import dayjs from 'dayjs';
import { z } from 'zod';

// need better docs
export const JournalDateStringSchema = z
  .string()
  .refine((val) => dayjs(val, 'YYYY-MM-DD', true).isValid(), {
    message: 'format date is YYYY-MM-DD ex: 2023-01-10',
  })
  .transform((val) => dayjs(val, 'YYYY-MM-DD', true).toDate())
  .refine((val) => dayjs(val).isSameOrBefore(dayjs(), 'day'), {
    message: 'date must not be in the future',
  });

export const CreateJournalSchema = z.object({
  content: z.string().min(10).max(5000),
  title: z.string().min(10).max(255),
  emotions: z
    .array(z.string().min(1, { message: 'This field cannot be empty' }).max(70))
    .min(1, { message: 'At least one emotion is required' }),
  topics: z
    .array(z.string().min(1, { message: 'This field cannot be empty' }).max(70))
    .min(1, { message: 'At least one topic is required' }),
  date: JournalDateStringSchema,
  isPrivate: z.boolean().optional().default(false),
});

export type CreateJournalDto = z.infer<typeof CreateJournalSchema>;
