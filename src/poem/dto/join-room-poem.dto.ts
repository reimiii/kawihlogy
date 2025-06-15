import { z } from 'zod';

export const JoinRoomPoemSchema = z.object({
  jobId: z.string().regex(/^([^:]+):([^:]+):([^:]+)$/),
});

export type JoinRoomPoemDto = z.infer<typeof JoinRoomPoemSchema>;
