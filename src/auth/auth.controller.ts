import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';
import { LoginDto, LoginSchema } from './dto/login.dto';
import { RegisterDto, RegisterSchema } from './dto/register.dto';
import { JwtToken } from './types/auth.type';

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
}
