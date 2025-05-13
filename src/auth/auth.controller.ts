/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, Logger, Post } from '@nestjs/common';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';
import { LoginDto, LoginSchema } from './dto/login.dto';
import { RegisterDto, RegisterSchema } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body(new ZodValidationPipe(LoginSchema)) body: LoginDto) {
    this.logger.log('start', this.login.name);
    console.log('body', body);

    this.logger.log('finish', this.login.name);
  }

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(RegisterSchema)) body: RegisterDto,
  ) {
    this.logger.log('start', this.register.name);

    const result = await this.authService.register({
      payload: body,
    });

    this.logger.log('finish', this.register.name);

    return result;
  }
}
