import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Identity } from 'src/core/decorators/identity.decorator';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';
import { LoginDto, LoginSchema } from './dto/login.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { RegisterDto, RegisterSchema } from './dto/register.dto';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { JwtToken } from './types/auth.type';
import { UserClaims } from './types/jwt-payload.type';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @HttpCode(200)
  @Post('login')
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) body: LoginDto,
  ): Promise<JwtToken> {
    this.logger.log('start controller login');

    const result = await this.authService.login({
      payload: body,
    });

    this.logger.log('finish controller login');

    return result;
  }

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(RegisterSchema)) body: RegisterDto,
  ): Promise<JwtToken> {
    this.logger.log('start controller register');

    const result = await this.authService.register({
      payload: body,
    });

    this.logger.log('finish controller register');

    return result;
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@Identity() user: UserClaims) {
    this.logger.log('start controller profile');

    const result = await this.authService.getUserProfile(user.id);

    this.logger.log('finish controller profile');

    return new ProfileResponseDto(result);
  }
}
