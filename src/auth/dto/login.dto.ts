import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200),
});

export type LoginDto = z.infer<typeof LoginSchema>;
