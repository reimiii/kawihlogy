import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { EnvService } from '../env/env.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [EnvService],
      useFactory: (env: EnvService): TypeOrmModuleOptions => {
        const paths = {
          entities: `${process.cwd()}/dist/**/*.entity{.ts,.js}`,
          migrations: `${process.cwd()}/dist/_infrastructure/database/migrations/**/*{.ts,.js}`,
        };

        return {
          type: env.get('DB_TYPE'),
          host: env.get('DB_HOST'),
          port: env.get('DB_PORT'),
          username: env.get('DB_USERNAME'),
          password: env.get('DB_PASSWORD'),
          database: env.get('DB_NAME'),
          entities: [paths.entities],
          migrations: [paths.migrations],
          migrationsRun: env.get('DB_SYNCHRONIZE'),
          logging: env.get('DB_LOGGING'),
          autoLoadEntities: true,
          logger: 'advanced-console',
        };
      },

      dataSourceFactory: async (options: DataSourceOptions) => {
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      },
    }),
  ],
})
export class DatabaseModule {}
