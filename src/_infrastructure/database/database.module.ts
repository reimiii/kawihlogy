import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EnvModule } from '../env/env.module';
import { EnvService } from '../env/env.service';
import { DataSource, DataSourceOptions } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (env: EnvService): TypeOrmModuleOptions => {
        const paths = {
          entities: `${process.cwd()}/src/**/*.entity{.ts,.js}`,
          migrations: `${process.cwd()}/src/_infrastructure/migrations/**/*{.ts,.js}`,
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
          logger: 'formatted-console',
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
