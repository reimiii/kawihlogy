import { UserClaims } from 'src/auth/types/jwt-payload.type';
import { EntityManager } from 'typeorm';
import { z } from 'zod/v4';
export interface GeneratePoemData {
  journalId: string;
  requestedBy: UserClaims;
}

export type PoemJobData = GeneratePoemData;

export type HandlePoemOpts = {
  jobData: PoemJobData;
  entityManager: EntityManager;
};

export const PoemContentPayloadSchema = z.object({
  title: z.string(),
  stanzas: z.array(z.array(z.string())),
});

export type PoemContentPayload = z.infer<typeof PoemContentPayloadSchema>;
