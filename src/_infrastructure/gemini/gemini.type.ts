// type SupportedMimeType = 'text/plain' | 'application/json';

import { SchemaUnion } from '@google/genai';

interface BaseParams {
  prompt: string;
  systemInstructor?: string;
}

type VoiceName = 'Zephyr' | 'Kore' | 'Charon';
type LanguageCode = 'en-US';

interface PlainTextParams extends BaseParams {
  responseMimeType: 'text/plain'; // default
}

interface JsonParams extends BaseParams {
  responseMimeType: 'application/json';
  responseSchema: SchemaUnion;
}

export type GenerateTextParams = PlainTextParams | JsonParams;

export type GenerateAudioParam = BaseParams & {
  voiceName: VoiceName;
  language: LanguageCode;
};

export interface WavConversionOptions {
  numChannels: number;
  sampleRate: number;
  bitsPerSample: number;
}

export interface TtsBuff {
  buffer: Buffer;
  mimeType: string;
  ext: string;
}
