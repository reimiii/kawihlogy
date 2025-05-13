import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { LoginCommand } from './commands/login.command';
import { RegisterCommand } from './commands/register.command';
import { RolesPermissions } from './constants/roles-permissions.map';
import { JwtToken, LoginOptions, RegisterOptions } from './types/auth.type';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly moduleRef: ModuleRef,
    private readonly ds: DataSource,
  ) {}

  onModuleInit() {
    console.log(Object.keys(RolesPermissions['echo']));
    console.log(RolesPermissions);
  }

  async login(params: LoginOptions): Promise<JwtToken> {
    this.logger.log('start auth login');

    const command = await this.moduleRef.resolve(LoginCommand);
    const context = await command.execute({
      payload: params.payload,
    });

    this.logger.log('finish auth login');

    return context;
  }

  async register(params: RegisterOptions): Promise<JwtToken> {
    this.logger.log('start auth register');

    const result = await this.ds.transaction(async (manager) => {
      const command = await this.moduleRef.resolve(RegisterCommand);
      const context = await command.execute({
        payload: params.payload,
        entityManager: manager,
      });

      return context;
    });

    this.logger.log('finish auth register');

    return result;
  }

  async getUserProfile(id: string): Promise<User> {
    this.logger.log('start get profile');

    const user = await this.userService.findOne({
      by: { key: 'id', value: id },
    });

    if (!user) throw new NotFoundException('user not found');

    this.logger.log('finish get profile');

    return user;
  }
}
