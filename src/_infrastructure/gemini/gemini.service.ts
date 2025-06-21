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

    const response = await chat
      .sendMessage({
        message: opts.prompt,
        config: {
          responseMimeType: opts.responseMimeType,
          responseSchema:
            opts.responseMimeType === 'application/json'
              ? opts.responseSchema
              : undefined,
        },
      })
      .catch((error) => {
        this.logger.error(error);
        throw error;
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
    let chunkCount = 0;
    let totalDataReceived = 0;

    for await (const chunk of res) {
      chunkCount++;
      this.logger.debug(`Processing chunk ${chunkCount}`);

      const [candidate] = chunk.candidates ?? [];

      // More lenient chunk validation - check if we have any content
      if (!candidate?.content?.parts?.length) {
        this.logger.debug(`Chunk ${chunkCount}: No content parts, skipping`);
        continue;
      }

      for (const part of candidate.content.parts) {
        const inlineData = part?.inlineData;

        // Skip only if there's absolutely no data
        if (!inlineData?.data) {
          this.logger.debug(
            `Chunk ${chunkCount}: No inline data, checking next part`,
          );
          continue;
        }

        const { data: base64, mimeType } = inlineData;
        const extension = mime.getExtension(mimeType || '');

        let buffer: Buffer;

        if (extension) {
          try {
            buffer = Buffer.from(base64 || '', 'base64');
            this.logger.debug(
              `Chunk ${chunkCount}: Decoded ${buffer.length} bytes`,
            );
          } catch (e) {
            this.logger.warn(
              `Chunk ${chunkCount}: Base64 decode failed, attempting recovery`,
              e,
            );
            // Try to clean base64 string and retry
            try {
              const cleanedBase64 = (base64 || '').replace(
                /[^A-Za-z0-9+/=]/g,
                '',
              );
              buffer = Buffer.from(cleanedBase64, 'base64');
              this.logger.debug(
                `Chunk ${chunkCount}: Recovery successful, decoded ${buffer.length} bytes`,
              );
            } catch (recoveryError) {
              this.logger.error(
                `Chunk ${chunkCount}: Recovery failed, skipping chunk`,
                recoveryError,
              );
              continue;
            }
          }
        } else {
          try {
            buffer = this.convertToWav(base64 || '', mimeType || '');
            this.logger.debug(
              `Chunk ${chunkCount}: Converted to WAV, ${buffer.length} bytes`,
            );
            if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
              this.logger.error(
                `Chunk ${chunkCount}: Invalid buffer from convertToWav`,
              );
              continue;
            }
          } catch (conversionError) {
            this.logger.error(
              `Chunk ${chunkCount}: WAV conversion failed`,
              conversionError,
            );
            continue;
          }
        }

        if (buffer.length > 0) {
          buf.push(buffer);
          totalDataReceived += buffer.length;
          this.logger.debug(
            `Chunk ${chunkCount}: Added ${buffer.length} bytes, total: ${totalDataReceived}`,
          );
        }
      }
    }

    this.logger.log(
      `Stream completed: ${chunkCount} chunks processed, ${buf.length} buffers collected, ${totalDataReceived} total bytes`,
    );

    const finalBuff = Buffer.concat(buf);

    this.logger.log(
      `Generated TTS audio buffer: ${(finalBuff.length / 1024).toFixed(2)} KB from ${buf.length} chunks, equal to ${(finalBuff.length / (1024 * 1024)).toFixed(2)} in Mb`,
    );

    if (!finalBuff.length) {
      throw new Error(
        `TTS result is empty - processed ${chunkCount} chunks but got no audio data`,
      );
    }

    // Validate audio buffer has reasonable size (at least 1KB for meaningful audio)
    if (finalBuff.length < 1024) {
      this.logger.warn(
        `TTS buffer seems unusually small: ${finalBuff.length} bytes`,
      );
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
