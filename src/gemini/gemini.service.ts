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

  //   async onModuleInit() {
  //     const poemSchema: Schema = {
  //       type: Type.OBJECT,
  //       properties: {
  //         title: {
  //           type: Type.STRING,
  //         },
  //         stanzas: {
  //           type: Type.ARRAY,
  //           items: {
  //             type: Type.ARRAY,
  //             items: {
  //               type: Type.STRING,
  //             },
  //           },
  //         },
  //       },
  //       required: ['title', 'stanzas'],
  //       propertyOrdering: ['title', 'stanzas'],
  //     };

  //     const r = await this.generateText({
  //       prompt: `
  // I have a journal text with a maximum length of 5,000 characters: "Today I felt exhausted after a long day of work, but watching the sunset by the beach calmed me. I reflected on life and how time slips away so quickly."

  // From this journal, create a poem in English that:
  // 1. Highlights the following topics: [sunset, life reflection, time].
  // 2. Conveys the following emotions: [exhaustion, calm, melancholic].
  // 3. Is written in a free-verse style, with 3-4 stanzas, each containing 4-6 lines.
  // 4. Uses poetic language with vivid natural imagery and deep metaphors.
  // 5. Maintains a reflective and slightly melancholic tone.

  // Do not alter the facts from the journal, but transform the narrative into a flowing, emotional poem. Optionally, draw inspiration from the style of poets like Mary Oliver, focusing on simple yet profound language. Ensure the poem feels natural and emotionally resonant.`.trim(),
  //       responseMimeType: 'text/plain',
  //       // responseSchema: poemSchema,
  //     });

  //     const j = await this.generateText({
  //       prompt: `
  // I have a journal text with a maximum length of 5,000 characters: "Today I felt exhausted after a long day of work, but watching the sunset by the beach calmed me. I reflected on life and how time slips away so quickly."

  // From this journal, create a poem in English that:
  // 1. Highlights the following topics: [sunset, life reflection, time].
  // 2. Conveys the following emotions: [exhaustion, calm, melancholic].
  // 3. Is written in a free-verse style, with 3-4 stanzas, each containing 4-6 lines.
  // 4. Uses poetic language with vivid natural imagery and deep metaphors.
  // 5. Maintains a reflective and slightly melancholic tone.

  // Do not alter the facts from the journal, but transform the narrative into a flowing, emotional poem. Optionally, draw inspiration from the style of poets like Mary Oliver, focusing on simple yet profound language. Ensure the poem feels natural and emotionally resonant.`.trim(),
  //       responseMimeType: 'application/json',
  //       responseSchema: poemSchema,
  //     });

  //     console.log(this.safetySettings);
  //     console.log(this.generatorConf);
  //     console.log(' nice thing ');
  //     console.log(r);

  //     console.log(JSON.stringify(JSON.parse(j!), null, 2));
  //   }
}
