import { ConfigService } from '@nestjs/config';
import { EnvService } from '../env/env.service';
import { Env } from '../env/env';
import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

const config = new ConfigService<Env, true>();
const env = new EnvService(config);

const paths = {
  entities: `${process.cwd()}/src/**/*.entity{.ts,.js}`,
  migrations: `${process.cwd()}/src/_infrastructure/database/migrations/**/*{.ts,.js}`,
};

const ds = new DataSource({
  type: env.get('DB_TYPE'),
  host: env.get('DB_HOST'),
  port: env.get('DB_PORT'),
  username: env.get('DB_USERNAME'),
  password: env.get('DB_PASSWORD'),
  database: env.get('DB_NAME'),
  synchronize: false,
  entities: [paths.entities],
  migrations: [paths.migrations],
  migrationsRun: false,
  logging: true,
});

export default ds;
