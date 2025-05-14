import { Injectable, Logger } from '@nestjs/common';
import { FindOneOptionsBy } from 'src/core/repositories/utils/find-one.util';
import { PersistOptions } from 'src/core/repositories/utils/persist.util';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async findOne(
    params: FindOneOptionsBy<User, 'id' | 'email'>,
  ): Promise<User | null> {
    this.logger.log('start', this.findOne.name);

    const result = await this.userRepository.findOneUnique(params);

    this.logger.log('finish', this.findOne.name);

    return result;
  }

  async create<K extends keyof User>(
    params: PersistOptions<User, K>,
  ): Promise<User> {
    this.logger.log('start', this.create.name);

    const result = await this.userRepository.persist(params);

    this.logger.log('finish', this.create.name);

    return result;
  }
}
