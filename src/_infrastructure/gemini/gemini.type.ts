// type SupportedMimeType = 'text/plain' | 'application/json';

import { SchemaUnion } from '@google/genai';

interface BaseParams {
  prompt: string;
  systemInstructor?: string;
}

interface PlainTextParams extends BaseParams {
  responseMimeType: 'text/plain'; // default
}

interface JsonParams extends BaseParams {
  responseMimeType: 'application/json';
  responseSchema: SchemaUnion;
}

export type GenerateTextParams = PlainTextParams | JsonParams;
