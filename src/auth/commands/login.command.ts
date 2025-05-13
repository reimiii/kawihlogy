import {
  Injectable,
  InternalServerErrorException,
  Logger,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { RolesPermissions } from '../constants/roles-permissions.map';
import { JwtToken, LoginCommandOptions } from '../types/auth.type';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable({ scope: Scope.TRANSIENT })
export class LoginCommand {
  private readonly logger = new Logger(LoginCommand.name);

  private _context!: LoginCommandOptions;
  private _user: User;
  private _token: string;
  private _permissions: string[];

  private get user(): User {
    if (!this._user)
      throw new InternalServerErrorException(
        `${this.checkIfUserAvailable.name} not initialized`,
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

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  public async execute(params: LoginCommandOptions): Promise<JwtToken> {
    this.logger.log('executing login command');
    this._context = params;

    await this.checkIfUserAvailable();

    await this.checkIfHashPasswordValid();

    await this.createJwtPayload();

    this.logger.log('login command executed successfully');

    return {
      accessToken: this.token,
      permissions: this.permissions,
    };
  }

  private async checkIfUserAvailable(): Promise<void> {
    this.logger.log('checking if user is available');
    const { email } = this._context.payload;

    const user = await this.userService.findOne({
      by: { key: 'email', value: email },
    });

    if (!user) {
      throw new UnprocessableEntityException('email or password is incorrect');
    }

    this._user = user;
  }

  private async checkIfHashPasswordValid(): Promise<void> {
    this.logger.log('checking if password is valid');
    const { password } = this._context.payload;

    const isValid = await bcrypt.compare(password, this.user.password);

    if (!isValid) {
      throw new UnprocessableEntityException('email or password is incorrect');
    }
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
