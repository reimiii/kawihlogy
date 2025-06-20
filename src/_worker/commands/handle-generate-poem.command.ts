import { Schema, Type } from '@google/genai';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  Scope,
} from '@nestjs/common';
import { GeminiService } from 'src/_infrastructure/gemini/gemini.service';
import { JsonSchema } from 'src/core/types/zod.types';
import { Journal } from 'src/journal/entities/journal.entity';
import { JournalRepository } from 'src/journal/repositories/journal.repository';
import { Poem } from 'src/poem/entities/poem.entity';
import { PoemRepository } from 'src/poem/repositories/poem.repository';
import {
  HandlePoemOpts,
  PoemContentPayload,
  PoemContentPayloadSchema,
} from 'src/poem/types/poem.type';
import z from 'zod/v4';

/**
 * Command handler for generating a poem from a journal entry.
 * Handles prompt creation, schema definition, poem generation, and persistence.
 *
 * @remarks
 * This class is designed to be used with NestJS dependency injection (transient scope).
 */
@Injectable({ scope: Scope.TRANSIENT })
export class HandleGeneratePoemCommand {
  /** Logger instance for this command */
  private readonly logger = new Logger(HandleGeneratePoemCommand.name);
  /** Context options for poem generation */
  private _context!: HandlePoemOpts;

  /** Indicates if the poem is soft-deleted */
  private _isPoemSoftDeleted: boolean = false;
  /** The journal entity associated with the poem */
  private _journal: Journal;
  /** JSON schema for the poem structure */
  private _poemJsonSchema: Schema;
  /** Prompt string for the LLM */
  private _prompt: string;
  /** The generated poem content */
  private _generatedPoem: PoemContentPayload;
  /** The poem entity (if found) */
  private _poem: Poem;

  /**
   * Returns the loaded journal entity or throws if not initialized.
   */
  private get journal(): Journal {
    if (!this._journal)
      throw new InternalServerErrorException(
        `${this.loadJournalOrFail.name} Not Initialize`,
      );
    return this._journal;
  }

  /**
   * Returns the loaded poem entity or null if not found.
   * Also resets soft-delete flag if not found.
   */
  private get poem(): Poem | null {
    if (!this._poem) {
      this._isPoemSoftDeleted = false;
      return null;
    }

    return this._poem;
  }

  /**
   * Returns whether the poem is soft-deleted or throws if not initialized.
   */
  private get isPoemSoftDeleted(): boolean {
    if (typeof this._isPoemSoftDeleted === 'undefined')
      throw new InternalServerErrorException(
        `${this.checkIfPoemSoftDeleted.name} Not Initialize`,
      );
    return this._isPoemSoftDeleted;
  }

  /**
   * Returns the JSON schema for the poem or throws if not initialized.
   */
  private get poemJsonSchema(): Schema {
    if (!this._poemJsonSchema)
      throw new InternalServerErrorException(
        `${this.createSchemaPoem.name} Not Initialize`,
      );

    return this._poemJsonSchema;
  }

  /**
   * Returns the prompt for poem generation or throws if not initialized.
   */
  private get prompt(): string {
    if (!this._prompt)
      throw new InternalServerErrorException(
        `${this.createPoemPrompt.name} Not Initialize`,
      );

    return this._prompt;
  }

  /**
   * Returns the generated poem or throws if not initialized.
   */
  private get generatedPoem(): PoemContentPayload {
    if (!this._generatedPoem)
      throw new InternalServerErrorException(
        `${this.generatingJournalToPoem.name} Not Initialize Or Try Again`,
      );

    return this._generatedPoem;
  }

  /**
   * Constructs the command handler with required services.
   * @param geminiService Service for LLM text generation
   * @param journalRepository Service for journal entity access
   * @param poemRepository Repository for poem persistence
   */
  constructor(
    private readonly geminiService: GeminiService,
    private readonly journalRepository: JournalRepository,
    private readonly poemRepository: PoemRepository,
  ) {}

  /**
   * Main entry point for generating a poem from a journal.
   * Loads journal, checks for existing poem, generates poem, and persists result.
   * @param opts Options for poem generation
   */
  public async execute(opts: HandlePoemOpts) {
    this.logger.log('Poem generation started');
    this._context = opts;

    await this.loadJournalOrFail();
    await this.checkIfPoemSoftDeleted();

    this.logger.log('Generating poem...');
    await this.handleGeneratingPoem();

    this.logger.log('Poem generated, saving...');
    await this.createOrUpdatePoem();

    this.logger.log('Poem generation finished');
  }

  /**
   * Loads the journal entity or throws if not found.
   * Sets the _journal property.
   */
  private async loadJournalOrFail() {
    const {
      jobData: { identifier: journalId },
      entityManager,
    } = this._context;

    const res = await this.journalRepository.findOneUnique({
      by: { key: 'id', value: journalId },
      manager: entityManager,
    });

    this._journal = res!;
  }

  /**
   * Checks if a poem for the journal exists and is soft-deleted.
   * Sets the _isPoemSoftDeleted and _poem properties.
   */
  private async checkIfPoemSoftDeleted() {
    const { entityManager } = this._context;

    const res = await this.poemRepository.findOneUnique({
      by: { key: 'journalId', value: this.journal.id },
      manager: entityManager,
      withDeleted: true,
    });

    if (res && res.deletedAt) {
      this._isPoemSoftDeleted = true;
      this._poem = res;
    }
  }

  /**
   * Creates a new poem entity and persists it.
   */
  private async createNewPoem() {
    const { entityManager } = this._context;

    const entity = entityManager.create(Poem, {
      journalId: this.journal.id,
      content: this.generatedPoem,
    });

    await this.poemRepository.persist({
      entity: entity,
      manager: entityManager,
    });
  }

  /**
   * Updates an existing poem entity and unarchive it if soft-deleted.
   */
  private async updateExistingPoem() {
    const { entityManager } = this._context;

    const poem = this.poem!;
    poem.content = this.generatedPoem;

    const saved = await this.poemRepository.persist({
      entity: poem,
      manager: entityManager,
    });

    await this.poemRepository.unArchive({
      entity: saved,
      manager: entityManager,
    });
  }

  /**
   * Creates or updates a poem depending on soft-delete status.
   */
  private async createOrUpdatePoem() {
    if (this.isPoemSoftDeleted) {
      await this.updateExistingPoem();
    } else {
      await this.createNewPoem();
    }
  }

  /**
   * Defines the JSON schema for the poem structure.
   * Sets the _poemJsonSchema property.
   */
  private createSchemaPoem() {
    const poemSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
        },
        stanzas: {
          type: Type.ARRAY,
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
        },
      },
      required: ['title', 'stanzas'],
      propertyOrdering: ['title', 'stanzas'],
    };

    this._poemJsonSchema = poemSchema;
  }

  /**
   * Creates the prompt string for poem generation from the journal.
   * Sets the _prompt property.
   */
  private createPoemPrompt() {
    const combineRaw = [
      `I have a journal text with a maximum length of 5,000 characters: "${this.journal.content}"`,
      '',
      'From this journal, create a poem in English that:',
      `1. Highlights the following topics: [${this.journal.topics.join(', ')}].`,
      `2. Conveys the following emotions: [${this.journal.emotions.join(', ')}].`,
      `3. Is written in a free-verse style, with 3-4 stanzas, each containing 4-6 lines.`,
      `4. Uses poetic language with vivid natural imagery and deep metaphors.`,
      `5. Maintains a reflective and slightly melancholic tone.`,
      '',
      `Do not alter the facts from the journal, but transform the narrative into a flowing, emotional poem. Optionally, draw inspiration from the style of poets like Mary Oliver, focusing on simple yet profound language. Ensure the poem feels natural and emotionally resonant.`,
    ].join('\n');

    this._prompt = combineRaw;
  }

  /**
   * Calls the LLM service to generate a poem from the prompt and schema.
   * Sets the _generatedPoem property.
   */
  private async generatingJournalToPoem() {
    const chat = await this.geminiService.generateText({
      prompt: this.prompt,
      responseMimeType: 'application/json',
      responseSchema: this.poemJsonSchema,
    });

    const chatParse = JsonSchema.safeParse(chat);

    if (!chatParse.success) {
      this.logger.error(z.prettifyError(chatParse.error));
      throw new Error(`Response from LLM is not valid JSON, Try again!`);
    }

    const res = PoemContentPayloadSchema.safeParse(JSON.parse(chat!));

    if (!res.success) {
      this.logger.error(z.prettifyError(res.error));
      throw new Error(`Invalid poem response: ${z.prettifyError(res.error)}`);
    }

    this._generatedPoem = res.data;
  }

  /**
   * Orchestrates prompt/schema creation and poem generation.
   */
  private async handleGeneratingPoem() {
    this.createPoemPrompt();
    this.createSchemaPoem();
    await this.generatingJournalToPoem();
  }
}
