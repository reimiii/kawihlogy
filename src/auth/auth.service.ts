import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { LoginCommand } from './commands/login.command';
import { RegisterCommand } from './commands/register.command';
import { RolesPermissions } from './constants/roles-permissions.map';
import { JwtToken, LoginOptions, RegisterOptions } from './types/auth.type';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
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
}
