import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { UserClaims } from 'src/auth/types/jwt-payload.type';
import { Identity } from 'src/core/decorators/identity.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { CreatePoemDto, CreatePoemSchema } from './dto/create-poem.dto';
import { PoemIdDto, PoemIdSchema } from './dto/poem-id.dto';
import { PoemService } from './poem.service';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('poem')
export class PoemController {
  constructor(private readonly poemService: PoemService) {}

  @HttpCode(200)
  @Post()
  async createQueuePoemText(
    @Body(new ZodValidationPipe(CreatePoemSchema)) body: CreatePoemDto,
    @Identity() createBy: UserClaims,
  ) {
    const { data, statusCode } = await this.poemService.triggerPoemTextQueue({
      by: createBy,
      identifier: body,
    });

    if (statusCode === HttpStatus.ACCEPTED) {
      throw new HttpException(data, HttpStatus.ACCEPTED);
    }

    return data;
  }

  @HttpCode(200)
  @Post(':id/audio')
  async createQueuePoemAudio(
    @Param(new ZodValidationPipe(PoemIdSchema)) param: PoemIdDto,
    @Identity() createBy: UserClaims,
  ) {
    const { data, statusCode } = await this.poemService.triggerPoemAudioQueue({
      by: createBy,
      identifier: param,
    });

    if (statusCode === HttpStatus.ACCEPTED) {
      throw new HttpException(data, HttpStatus.ACCEPTED);
    }

    return data;
  }
}
