import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GoogleGenAIProvider } from './gemini.provider';

@Module({
  providers: [GeminiService, GoogleGenAIProvider],
  exports: [GeminiService],
})
export class GeminiModule {}
