import { GoogleGenAI } from '@google/genai';
import { Provider } from '@nestjs/common';
import { EnvService } from 'src/_infrastructure/env/env.service';

export const GoogleGenAIProvider: Provider<GoogleGenAI> = {
  provide: GoogleGenAI,
  useFactory: (env: EnvService) => {
    const ai = new GoogleGenAI({
      apiKey: env.get('GEMINI_API_KEY'),
    });

    return ai;
  },
  inject: [EnvService],
};
