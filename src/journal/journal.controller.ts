import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { UserClaims } from 'src/auth/types/jwt-payload.type';
import { Identity } from 'src/core/decorators/identity.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import {
  CreateJournalDto,
  CreateJournalSchema,
} from './dto/create-journal.dto';
import { JournalIdDto, JournalIdSchema } from './dto/journal-id.dto';
import { JournalPaginateListResponse } from './dto/journal-paginate-list-response.dto';
import {
  JournalPaginationQueryDto,
  JournalPaginationQuerySchema,
} from './dto/journal-paginate-request.dto';
import { JournalResponseDto } from './dto/journal-response.dto';
import {
  UpdateJournalDto,
  UpdateJournalSchema,
} from './dto/update-journal.dto';
import { JournalService } from './journal.service';
import { OptionalIdentity } from 'src/core/decorators/optional-identity.decorator';
import { IsPublic } from 'src/core/decorators/is-public.decorator';

/**
 * Controller responsible for handling HTTP requests related to journal operations
 * @class JournalController
 */
@UseInterceptors(ClassSerializerInterceptor)
@Controller('journal')
export class JournalController {
  private readonly logger = new Logger(JournalController.name);

  constructor(private readonly journalService: JournalService) {}

  /**
   * Creates a new journal entry
   * @param {CreateJournalDto} createJournalDto - The data for creating a new journal
   * @param {UserClaims} createdBy - The user creating the journal
   * @returns {Promise<void>} - Returns nothing on success
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateJournalSchema))
    createJournalDto: CreateJournalDto,
    @Identity() createdBy: UserClaims,
  ): Promise<void> {
    this.logger.log('Starting create journal');

    await this.journalService.create({
      payload: createJournalDto,
      createBy: createdBy,
    });

    this.logger.log('Finished create journal');
  }

  /**
   * Retrieves a paginated list of journal entries
   * @param {JournalPaginationQueryDto} query - The pagination query parameters
   * @returns {Promise<JournalPaginateListResponse>} - Returns paginated list of journals
   */
  @UseGuards(JwtAuthGuard)
  @IsPublic()
  @Get()
  async findAll(
    @Query(new ZodValidationPipe(JournalPaginationQuerySchema))
    query: JournalPaginationQueryDto,
    @OptionalIdentity() accessBy: UserClaims | undefined,
  ): Promise<JournalPaginateListResponse> {
    this.logger.log('Starting get all journals');

    const res = await this.journalService.paginatePublic(query, accessBy);

    this.logger.log('Finished get all journals');
    return new JournalPaginateListResponse(res);
  }

  /**
   * Retrieves a specific journal entry by ID
   * @param {JournalIdDto} params - The journal ID parameters
   * @param {UserClaims} accessBy - The user accessing the journal
   * @returns {Promise<JournalResponseDto>} - Returns the requested journal entry
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param(new ZodValidationPipe(JournalIdSchema)) params: JournalIdDto,
    @Identity() accessBy: UserClaims,
  ): Promise<JournalResponseDto> {
    this.logger.log('Starting get journal by id');

    const res = await this.journalService.findOnePublic({
      identifier: params,
      accessBy: accessBy,
    });

    this.logger.log('Finished get journal by id');
    return new JournalResponseDto(res);
  }

  /**
   * Updates an existing journal entry
   * @param {JournalIdDto} params - The journal ID parameters
   * @param {UpdateJournalDto} updateJournalDto - The data for updating the journal
   * @param {UserClaims} createdBy - The user updating the journal
   * @returns {Promise<void>} - Returns nothing on success
   */
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Patch(':id')
  async update(
    @Param(new ZodValidationPipe(JournalIdSchema)) params: JournalIdDto,
    @Body(new ZodValidationPipe(UpdateJournalSchema))
    updateJournalDto: UpdateJournalDto,
    @Identity() createdBy: UserClaims,
  ): Promise<void> {
    this.logger.log('Starting update journal');

    await this.journalService.update({
      payload: updateJournalDto,
      updateBy: createdBy,
      identifier: params,
    });

    this.logger.log('Finished update journal');
  }

  /**
   * Removes a journal entry
   * @param {JournalIdDto} params - The journal ID parameters
   * @param {UserClaims} deletedBy - The user deleting the journal
   * @returns {Promise<void>} - Returns nothing on success
   */
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete(':id')
  async remove(
    @Param(new ZodValidationPipe(JournalIdSchema)) params: JournalIdDto,
    @Identity() deletedBy: UserClaims,
  ): Promise<void> {
    this.logger.log('Starting delete journal');

    await this.journalService.remove({
      identifier: params,
      deleteBy: deletedBy,
    });

    this.logger.log('Finished delete journal');
  }
}
