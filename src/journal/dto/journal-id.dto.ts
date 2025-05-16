import { z } from 'zod';

export const JournalIdSchema = z.object({
  id: z.string().uuid(),
});

export type JournalIdDto = z.infer<typeof JournalIdSchema>;
