/* eslint-disable */
import { GenerationConfig, GoogleGenAI, SafetySetting } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { GENERATION_CONFIG, SAFETY_SETTINGS } from './gemini.config';
import { GenerateTextParams } from './gemini.type';

@Injectable()
export class GeminiService {
  private safetySettings: SafetySetting[] = SAFETY_SETTINGS;
  private generatorConf: GenerationConfig = GENERATION_CONFIG;

  constructor(private readonly ai: GoogleGenAI) {}

  async generateText(opts: GenerateTextParams) {
    const chat = this.ai.chats.create({
      model: 'gemini-1.5-pro',
      config: {
        systemInstruction: opts.systemInstructor,
        safetySettings: this.safetySettings,
        ...this.generatorConf,
      },
    });

    const response = await chat.sendMessage({
      message: opts.prompt,
      config: {
        responseMimeType: opts.responseMimeType,
        responseSchema:
          opts.responseMimeType === 'application/json'
            ? opts.responseSchema
            : undefined,
      },
    });

    return response.text;
  }

  async countTokens(prompt: string): Promise<number | undefined> {
    const response = await this.ai.models.countTokens({
      model: 'gemini-1.5-pro',
      contents: prompt,
    });

    return response.totalTokens;
  }
}
