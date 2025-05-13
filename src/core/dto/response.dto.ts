import { z } from 'zod';

export const ResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.any().optional(),
});

export type ResponseDto = z.infer<typeof ResponseSchema>;

export const ResponseErrorSchema = z.object({
  status: z.string(),
  message: z.string(),
  errors: z.array(z.any()).optional(),
});

export type ResponseErrorDto = z.infer<typeof ResponseErrorSchema>;

export const ResponsePaginateSchema = z.object({
  status: z.string(),
  message: z.string(),
  data: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    pages: z.number(),
    items: z.array(z.any()),
  }),
});
export type ResponsePaginateDto = z.infer<typeof ResponsePaginateSchema>;
