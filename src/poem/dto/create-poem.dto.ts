import z from 'zod';

export const CreatePoemSchema = z.object({
  journalId: z.string().uuid(),
});

export type CreatePoemDto = z.infer<typeof CreatePoemSchema>;
