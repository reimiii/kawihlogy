/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  Logger,
  OnModuleInit,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { JwtToken, LoginOptions, RegisterOptions } from './types/auth.type';
import { Role } from './enums/role.enum';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './types/jwt-payload.type';
import { RolesPermissions } from './constants/roles-permissions.map';
import { DataSource } from 'typeorm';
import { ModuleRef } from '@nestjs/core';
import { RegisterCommand } from './commands/register.command';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly moduleRef: ModuleRef,
    private readonly ds: DataSource,
  ) {}

  onModuleInit() {
    console.log(Object.keys(RolesPermissions['echo']));
    console.log(RolesPermissions);
  }

  async login(params: LoginOptions) {
    // const payload = { username: user.username, password: user.password };
    // return {
    //   access_token: this.jwtService.sign(payload),
    // };
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
