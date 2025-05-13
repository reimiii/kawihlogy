import { EntityManager } from 'typeorm';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

export interface LoginOptions {
  payload: LoginDto;
}

export interface RegisterOptions {
  payload: RegisterDto;
}

export interface RegisterCommandOptions extends RegisterOptions {
  entityManager: EntityManager;
}

export interface JwtToken {
  accessToken: string;
  permissions: string[];
}
