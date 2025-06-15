import { UserClaims } from 'src/auth/types/jwt-payload.type';
import { ActionOpts } from 'src/core/types/option.types';
import { EntityManager } from 'typeorm';
import { z } from 'zod/v4';
import { CreatePoemDto } from '../dto/create-poem.dto';
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

export type QueuePoemTriggerOpts = ActionOpts<CreatePoemDto>;

export type PoemState =
  | {
      status: 'added';
    }
  | {
      status: 'processing';
    }
  | {
      status: 'completed';
    }
  | {
      status: 'failed';
      error: string;
    }
  | {
      status: 'waiting';
    }
  | {
      status: 'active';
    };
