import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PoemService } from './poem.service';
import { CreatePoemDto, CreatePoemSchema } from './dto/create-poem.dto';
import { UserClaims } from 'src/auth/types/jwt-payload.type';
import { Identity } from 'src/core/decorators/identity.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('poem')
export class PoemController {
  constructor(private readonly poemService: PoemService) {}

  @HttpCode(200)
  @Post()
  async createQueuePoem(
    @Body(new ZodValidationPipe(CreatePoemSchema)) body: CreatePoemDto,
    @Identity() createBy: UserClaims,
  ) {
    const { data, statusCode } = await this.poemService.triggerPoemQueue({
      by: createBy,
      identifier: body,
    });

    if (statusCode === HttpStatus.ACCEPTED) {
      throw new HttpException(data, HttpStatus.ACCEPTED);
    }

    return data;
  }
}
