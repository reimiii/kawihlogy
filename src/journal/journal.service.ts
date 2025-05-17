import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { CreateJournalCommand } from './commands/create-journal.command';
import { DeleteJournalCommand } from './commands/delete-journal.command';
import { UpdateJournalCommand } from './commands/update-journal.command';
import {
  CreateJournalOptions,
  DeleteJournalOptions,
  UpdateJournalOptions,
} from './types/journal.type';

@Injectable()
export class JournalService {
  private readonly logger = new Logger(JournalService.name);

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly ds: DataSource,
  ) {}

  async create(params: CreateJournalOptions): Promise<void> {
    this.logger.log('start from service create');

    await this.ds.transaction(async (manager) => {
      const command = await this.moduleRef.resolve(CreateJournalCommand);
      await command.execute({
        payload: params.payload,
        createBy: params.createBy,
        entityManager: manager,
      });
    });

    this.logger.log('finish from service create');
  }

  findAll() {
    return `This action returns all journal`;
  }

  findOne(id: number) {
    return `This action returns a #${id} journal`;
  }

  async update(params: UpdateJournalOptions) {
    this.logger.log('start from service update');

    await this.ds.transaction(async (manager) => {
      const command = await this.moduleRef.resolve(UpdateJournalCommand);
      await command.execute({
        identifier: params.identifier,
        payload: params.payload,
        updateBy: params.updateBy,
        entityManager: manager,
      });
    });

    this.logger.log('finish from service update');
  }

  async remove(params: DeleteJournalOptions): Promise<void> {
    this.logger.log('start from service remove');

    await this.ds.transaction(async (manager) => {
      const command = await this.moduleRef.resolve(DeleteJournalCommand);

      await command.execute({
        identifier: params.identifier,
        deleteBy: params.deleteBy,
        entityManager: manager,
      });
    });

    this.logger.log('finish from service remove');
  }
}
