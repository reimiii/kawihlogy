/* eslint-disable */
import {
  GenerationConfig,
  GoogleGenAI,
  Modality,
  SafetySetting,
} from '@google/genai';
import { Injectable, Logger } from '@nestjs/common';
import mime from 'mime';
import { GENERATION_CONFIG, SAFETY_SETTINGS } from './gemini.config';
import {
  GenerateAudioParam,
  GenerateTextParams,
  WavConversionOptions,
} from './gemini.type';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private safetySettings: SafetySetting[] = SAFETY_SETTINGS;
  private generatorConf: GenerationConfig = GENERATION_CONFIG;

  constructor(private readonly ai: GoogleGenAI) {}

  async generateText(opts: GenerateTextParams) {
    this.logger.log('Generating text with options:', JSON.stringify(opts));
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

    this.logger.debug('Generated text response');
    return response.text;
  }

  async generateTts(opts: GenerateAudioParam) {
    this.logger.log('Generating TTS with options:', JSON.stringify(opts));
    const res = await this.ai.models
      .generateContentStream({
        model: 'gemini-2.5-pro-preview-tts',
        contents: {
          role: 'user',
          parts: [{ text: opts.prompt }],
        },
        config: {
          systemInstruction: opts.systemInstructor,
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            languageCode: opts.language,
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: opts.voiceName,
              },
            },
          },
        },
      })
      .catch((error) => {
        this.logger.error(error);
        throw error;
      });

    const buf: Buffer[] = [];

    for await (const chunk of res) {
      const [candidate] = chunk.candidates ?? [];
      const [part] = candidate?.content?.parts ?? [];
      const inlineData = part?.inlineData;

      if (!candidate || !part || !inlineData || !inlineData.data) {
        this.logger.warn('Skipping incomplete chunk');
        continue;
      }

      const { data: base64, mimeType } = inlineData;
      const extension = mime.getExtension(mimeType || '');

      let buffer: Buffer;

      if (extension) {
        try {
          buffer = Buffer.from(base64 || '', 'base64');
        } catch (e) {
          this.logger.warn('Base64 decode failed', e);
          continue; // skip corrupted base64
        }
      } else {
        buffer = this.convertToWav(base64 || '', mimeType || '');
        if (!Buffer.isBuffer(buffer)) {
          this.logger.error('Invalid buffer from convertToWav');
          continue;
        }
      }
      buf.push(buffer);
    }

    const finalBuff = Buffer.concat(buf);

    this.logger.debug(`Generated TTS audio buffer: ${finalBuff.length}`);

    if (!finalBuff.length) {
      throw new Error('TTS result is empty');
    }

    return {
      buffer: finalBuff,
      mimeType: 'audio/wav',
      ext: 'wav',
    };
  }

  async countTokens(prompt: string): Promise<number | undefined> {
    this.logger.log('Counting tokens for prompt');
    const response = await this.ai.models.countTokens({
      model: 'gemini-1.5-pro',
      contents: prompt,
    });

    this.logger.debug(`Token count: ${response.totalTokens}`);
    return response.totalTokens;
  }

  private convertToWav(rawData: string, mimeType: string) {
    this.logger.debug('Converting audio to WAV format');
    const options = this.parseMimeType(mimeType);
    const wavHeader = this.createWavHeader(rawData.length, options);
    const buffer = Buffer.from(rawData, 'base64');

    return Buffer.concat([wavHeader, buffer]);
  }

  private parseMimeType(mimeType: string) {
    this.logger.debug('Parsing MIME type:', mimeType);
    const [fileType, ...params] = mimeType.split(';').map((s) => s.trim());
    const [_, format] = fileType.split('/');

    const options: Partial<WavConversionOptions> = {
      numChannels: 1,
    };

    if (format && format.startsWith('L')) {
      const bits = parseInt(format.slice(1), 10);
      if (!isNaN(bits)) {
        options.bitsPerSample = bits;
      }
    }

    for (const param of params) {
      const [key, value] = param.split('=').map((s) => s.trim());
      if (key === 'rate') {
        options.sampleRate = parseInt(value, 10);
      }
    }

    return options as WavConversionOptions;
  }

  private createWavHeader(dataLength: number, options: WavConversionOptions) {
    this.logger.debug(
      'Creating WAV header with options:',
      JSON.stringify(options),
    );
    const { numChannels, sampleRate, bitsPerSample } = options;

    // http://soundfile.sapp.org/doc/WaveFormat

    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const buffer = Buffer.alloc(44);

    buffer.write('RIFF', 0); // ChunkID
    buffer.writeUInt32LE(36 + dataLength, 4); // ChunkSize
    buffer.write('WAVE', 8); // Format
    buffer.write('fmt ', 12); // Subchunk1ID
    buffer.writeUInt32LE(16, 16); // Subchunk1Size (PCM)
    buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
    buffer.writeUInt16LE(numChannels, 22); // NumChannels
    buffer.writeUInt32LE(sampleRate, 24); // SampleRate
    buffer.writeUInt32LE(byteRate, 28); // ByteRate
    buffer.writeUInt16LE(blockAlign, 32); // BlockAlign
    buffer.writeUInt16LE(bitsPerSample, 34); // BitsPerSample
    buffer.write('data', 36); // Subchunk2ID
    buffer.writeUInt32LE(dataLength, 40); // Subchunk2Size

    return buffer;
  }
}
