import { Provider } from '@nestjs/common';
import { JournalRepository } from 'src/journal/repositories/journal.repository';
import { PoemRepository } from 'src/poem/repositories/poem.repository';

export const PoemProvider: Provider[] = [PoemRepository, JournalRepository];
