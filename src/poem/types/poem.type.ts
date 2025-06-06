import { UserClaims } from 'src/auth/types/jwt-payload.type';

export interface GeneratePoemData {
  journalId: string;
  requestedBy: UserClaims;
}

export type PoemJobData = GeneratePoemData;
