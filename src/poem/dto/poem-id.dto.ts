import { z } from 'zod';

export const PoemIdSchema = z.object({
  id: z.string().uuid(),
});

export type PoemIdDto = z.infer<typeof PoemIdSchema>;
