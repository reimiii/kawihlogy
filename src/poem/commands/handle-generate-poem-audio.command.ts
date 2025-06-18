import {
  Injectable,
  InternalServerErrorException,
  Logger,
  Scope,
} from '@nestjs/common';
import { GeminiService } from 'src/_infrastructure/gemini/gemini.service';
import { PoemRepository } from '../repositories/poem.repository';
import { HandlePoemOpts } from '../types/poem.type';
import { Poem } from '../entities/poem.entity';
import { FileService } from 'src/_infrastructure/file/file.service';
import mime from 'mime';

@Injectable({ scope: Scope.TRANSIENT })
export class HandleGeneratePoemAudioCommand {
  /** Logger instance for this command */
  private readonly logger = new Logger(HandleGeneratePoemAudioCommand.name);

  /** Context options for poem generation */
  private _context!: HandlePoemOpts;

  private _poem: Poem;

  private _prompt: string;

  private _buffer: Buffer;

  private _mimeType: string;

  private _keyPath: string;

  private get prompt(): string {
    if (!this._prompt)
      throw new InternalServerErrorException(
        `${this.createPoemAudioPrompt.name} Not Initialize`,
      );

    return this._prompt;
  }

  private get poem(): Poem {
    if (!this._poem) throw new Error('Poem Not Initialized');
    return this._poem;
  }

  private get buffer(): Buffer {
    if (!this._buffer)
      throw new Error(`${this.createTtsBuffer.name} Not Initialized`);
    return this._buffer;
  }

  private get mimeType(): string {
    if (!this._mimeType)
      throw new Error(`${this.createTtsBuffer.name} Not Initialized`);
    return this._mimeType;
  }

  private get keyPath(): string {
    if (!this._keyPath)
      throw new Error(`${this.generateKeyPath.name} Not Initialized`);
    return this._keyPath;
  }
  /**
   * Constructs the command handler with required services.
   * @param geminiService Service for LLM text generation
   * @param poemRepository Repository for poem persistence
   */
  constructor(
    private readonly geminiService: GeminiService,
    private readonly fileService: FileService,
    private readonly poemRepository: PoemRepository,
  ) {}

  public async execute(opts: HandlePoemOpts) {
    this.logger.log('Poem generation audio started');
    this._context = opts;

    await this.loadPoemOrThrown();

    this.logger.log('Handle Audio Generation');
    this.logger.log(`Start generateTts for jobId: ${opts.jobData.identifier}`);

    await this.handlePoemAudioGeneration();

    this.logger.log('Handle Audio Upload S3');
    await this.uploadAudioAndPersitFile();

    this.logger.log('Poem generation audio finished');
  }

  private async loadPoemOrThrown() {
    const {
      jobData: { identifier },
      entityManager,
    } = this._context;

    const res = await this.poemRepository.findOneUnique({
      by: { key: 'id', value: identifier },
      manager: entityManager,
    });

    if (!res) throw new Error('Poem Not Found');

    this._poem = res;
  }

  private createPoemAudioPrompt() {
    const combineRaw = [
      `Using the provided JSON data, generate a text-to-speech output that reads only the title and the stanzas of the poem exactly as they appear, with no additional explanations, introductions, or commentary. Read the title first, followed by each stanza in sequence, maintaining the original wording and structure. Ensure the output is clear and suitable for TTS, with appropriate pauses between the title and each stanza.`,
      '',
      'JSON Data:',
      `${JSON.stringify(this.poem.content)}`,
      '',
      '',
      `Output Format:`,
      `- Read the title: "${this.poem.content.title}"`,
      '- Pause briefly.',
      '- Read each stanza line by line, with a short pause between lines and a slightly longer pause between stanzas.',
      '- Do not add any extra text or commentary.',
    ].join('\n');

    this._prompt = combineRaw;
  }

  private async createTtsBuffer() {
    const { buffer, mimeType } = await this.geminiService.generateTts({
      prompt: this.prompt,
      voiceName: 'Charon',
      language: 'en-US',
    });

    this._buffer = buffer;
    this._mimeType = mimeType;
  }

  private async handlePoemAudioGeneration() {
    this.createPoemAudioPrompt();
    await this.createTtsBuffer();
  }

  private generateKeyPath() {
    console.log(this.mimeType);
    const ext = mime.getExtension(this.mimeType);

    if (!ext) throw new Error('Mime Is Undefine');

    const folder = `poem/${this.poem.id}`;

    const fileName = `${Date.now()}.${ext}`;

    const final = `${folder}/${fileName}`;

    this._keyPath = final;
  }

  private async saveAudioFile() {
    const { entityManager } = this._context;
    await this.fileService.save(
      {
        entity: {
          key: this.keyPath,
          mimeType: this.mimeType,
          originalName: this.poem.content.title,
          size: this.buffer.length,
        },
        manager: entityManager,
      },
      { body: this.buffer },
    );
  }

  private async uploadAudioAndPersitFile() {
    this.generateKeyPath();
    await this.saveAudioFile();
  }
}
