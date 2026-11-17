import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService, LoginResponse, SafeUser } from './auth.service';
import { CredentialsDto } from './dto/credentials.dto';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import type { AuthenticatedUser } from './jwt/jwt-payload.interface';

type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() credentials: CredentialsDto): Promise<SafeUser> {
    return this.authService.register(credentials);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() credentials: CredentialsDto): Promise<LoginResponse> {
    return this.authService.login(credentials);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() request: AuthenticatedRequest): AuthenticatedUser {
    return request.user;
  }
}
