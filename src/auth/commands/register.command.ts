import {
  Injectable,
  InternalServerErrorException,
  Logger,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { JwtToken, RegisterCommandOptions } from '../types/auth.type';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '../types/jwt-payload.type';
import { JwtService } from '@nestjs/jwt';
import { RolesPermissions } from '../constants/roles-permissions.map';

@Injectable({ scope: Scope.TRANSIENT })
export class RegisterCommand {
  private readonly logger = new Logger(RegisterCommand.name);
  private _context!: RegisterCommandOptions;
  private _user: User;
  private _token: string;
  private _permissions: string[];

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  private set context(value: RegisterCommandOptions) {
    this._context = value;
  }

  private get context(): RegisterCommandOptions {
    if (!this._context)
      throw new InternalServerErrorException(`context not initialized`);
    return this._context;
  }

  private get user(): User {
    if (!this._user)
      throw new InternalServerErrorException(
        `${this.createUser.name} not initialized`,
      );
    return this._user;
  }

  private get token(): string {
    if (!this._token)
      throw new InternalServerErrorException(
        `${this.createJwtPayload.name} not initialized`,
      );
    return this._token;
  }

  private get permissions(): string[] {
    if (!this._permissions)
      throw new InternalServerErrorException(
        `${this.createJwtPayload.name} not initialized`,
      );
    return this._permissions;
  }

  public async execute(params: RegisterCommandOptions): Promise<JwtToken> {
    this.logger.log('executing register command');
    this.context = params;

    await this.checkIfUserWithEmailExists();

    await this.createUser();

    await this.createJwtPayload();

    this.logger.log('register command executed successfully');
    return {
      accessToken: this.token,
      permissions: this.permissions,
    };
  }

  private async checkIfUserWithEmailExists(): Promise<void> {
    const { email } = this.context.payload;

    this.logger.log(`checking if user with email ${email} exists`);

    const existingUser = await this.userService.findOne({
      by: { key: 'email', value: email },
      manager: this.context.entityManager,
    });

    if (existingUser) {
      this.logger.log(`user with email ${email} already exists`);
      throw new UnprocessableEntityException(`user already exists`);
    }
  }

  private async createUser(): Promise<void> {
    const { name, email, password } = this.context.payload;

    this.logger.log(`creating user with email ${email}`);

    const hashedPassword = await bcrypt.hash(password, 10);

    this._user = await this.userService.create({
      entity: {
        name: name,
        email: email,
        password: hashedPassword,
      },
      manager: this.context.entityManager,
    });
  }

  private async createJwtPayload(): Promise<void> {
    this.logger.log(`creating jwt payload`);

    const jwtPayload: JwtPayload = {
      id: this.user.id,
      email: this.user.email,
      role: this.user.role,
    };

    this.logger.log('signing jwt token');
    const token = await this.jwtService.signAsync(jwtPayload);

    this.logger.log('checking permissions');
    const availablePermissions = Object.keys(RolesPermissions[this.user.role]);

    this._token = token;
    this._permissions = availablePermissions;
  }
}
