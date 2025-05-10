import { Module } from '@nestjs/common';
import { InfrastructureModule } from './_infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
})
export class AppModule {}
