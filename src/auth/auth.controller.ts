import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService, SafeUser } from './auth.service';
import { CredentialsDto } from './dto/credentials.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() credentials: CredentialsDto): Promise<SafeUser> {
    return this.authService.register(credentials);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() credentials: CredentialsDto): Promise<SafeUser> {
    return this.authService.login(credentials);
  }
}
