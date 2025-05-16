import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { UserClaims } from 'src/auth/types/jwt-payload.type';
import { Identity } from 'src/core/decorators/identity.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import {
  CreateJournalDto,
  CreateJournalSchema,
} from './dto/create-journal.dto';
import {
  UpdateJournalDto,
  UpdateJournalSchema,
} from './dto/update-journal.dto';
import { JournalService } from './journal.service';
import { JournalIdDto, JournalIdSchema } from './dto/journal-id.dto';

@UseGuards(JwtAuthGuard)
@Controller('journal')
export class JournalController {
  private readonly logger = new Logger(JournalController.name);

  constructor(private readonly journalService: JournalService) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateJournalSchema))
    createJournalDto: CreateJournalDto,
    @Identity() createdBy: UserClaims,
  ) {
    this.logger.log('start from controller');

    await this.journalService.create({
      payload: createJournalDto,
      createBy: createdBy,
    });

    this.logger.log('finish from controller');
  }

  @Get()
  findAll() {
    return this.journalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.journalService.findOne(+id);
  }

  @HttpCode(204)
  @Patch(':id')
  async update(
    @Param(new ZodValidationPipe(JournalIdSchema)) params: JournalIdDto,
    @Body(new ZodValidationPipe(UpdateJournalSchema))
    updateJournalDto: UpdateJournalDto,
    @Identity() createdBy: UserClaims,
  ): Promise<void> {
    this.logger.log('start from update controller');

    await this.journalService.update({
      payload: updateJournalDto,
      updateBy: createdBy,
      identifier: params,
    });

    this.logger.log('finish from update controller');
  }

  @HttpCode(204)
  @Delete(':id')
  async remove(
    @Param(new ZodValidationPipe(JournalIdSchema)) params: JournalIdDto,
    @Identity() deletedBy: UserClaims,
  ) {
    await this.journalService.remove({
      identifier: params,
      deleteBy: deletedBy,
    });
  }
}
