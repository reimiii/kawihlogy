import { DataSource } from 'typeorm';
import { EnvService } from '../env/env.service';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async (env: EnvService) => {
      const dataSource = new DataSource({
        type: env.get('DB_TYPE'),
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        username: env.get('DB_USERNAME'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_NAME'),
        entities: [`${process.cwd()}/src/**/*.entity{.ts,.js}`],
        synchronize: env.get('DB_SYNCHRONIZE'),
        logging: env.get('DB_LOGGING'),
        migrations: [
          `${process.cwd()}/src/_infrastructure/migrations/**/*{.ts,.js}`,
        ],
      });

      return dataSource.initialize();
    },
    inject: [EnvService],
  },
];
