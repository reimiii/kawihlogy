import { UserClaims } from 'src/auth/types/jwt-payload.type';
import { EntityManager } from 'typeorm';

export interface GeneratePoemData {
  journalId: string;
  requestedBy: UserClaims;
}

export type PoemJobData = GeneratePoemData;

export type HandlePoemOpts = {
  jobData: PoemJobData;
  entityManager: EntityManager;
};
