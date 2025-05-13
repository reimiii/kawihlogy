import { z } from 'zod';
import { LoginSchema } from './login.dto';

export const RegisterSchema = LoginSchema.extend({
  name: z.string().min(2).max(100),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
