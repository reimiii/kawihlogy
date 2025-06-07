import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiController } from './gemini.controller';
import { GoogleGenAIProvider } from './gemini.provider';

@Module({
  controllers: [GeminiController],
  providers: [GeminiService, GoogleGenAIProvider],
  exports: [GeminiService],
})
export class GeminiModule {}
