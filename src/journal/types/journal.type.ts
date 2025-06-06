import { UserClaims } from 'src/auth/types/jwt-payload.type';
import { CreateJournalDto } from '../dto/create-journal.dto';
import { UpdateJournalDto } from '../dto/update-journal.dto';
import { JournalIdDto } from '../dto/journal-id.dto';
import { EntityManager } from 'typeorm';
import { ActionOpts } from 'src/core/types/option.types';

export interface CreateJournalOptions {
  payload: CreateJournalDto;
  createBy: UserClaims;
}

export interface UpdateJournalOptions {
  identifier: JournalIdDto;
  payload: UpdateJournalDto;
  updateBy: UserClaims;
}

export interface DeleteJournalOptions {
  identifier: JournalIdDto;
  deleteBy: UserClaims;
}

export interface FindOneJournalOptions {
  identifier: JournalIdDto;
  accessBy: UserClaims;
}

export type QueuePoemTriggerOpts = ActionOpts<JournalIdDto>;

export interface CreateJournalCommandOptions extends CreateJournalOptions {
  entityManager: EntityManager;
}

export interface UpdateJournalCommandOptions extends UpdateJournalOptions {
  entityManager: EntityManager;
}

export interface DeleteJournalCommandOptions extends DeleteJournalOptions {
  entityManager: EntityManager;
}
