import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Req,
  Param,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';
import { UserDeviceDto } from './dto/response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { RequestUser, AuthResponse, AuthTokens } from './types/auth.types';
import { Request, Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ValidationPipe()) loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    console.log('AuthController: login called');
    console.log('Login DTO:', loginDto);
    const ip =
      req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const authResponse = await this.authService.login(loginDto, ip, userAgent);

    // Set HttpOnly cookies
    res.cookie('access_token', authResponse.tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.cookie('refresh_token', authResponse.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return authResponse;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokens> {
    const refreshToken = req.cookies['refresh_token'];
    const tokens = await this.authService.refreshTokens({ refreshToken });

    // Reset cookies
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return tokens;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    await this.authService.logout(refreshToken);

    // Clear cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAll(
    @CurrentUser() user: RequestUser,
  ): Promise<{ message: string }> {
    await this.authService.logoutAll(user.id);
    return { message: 'Logged out from all devices successfully' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: RequestUser): Promise<RequestUser> {
    return user;
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  async validateToken(
    @CurrentUser() user: RequestUser,
  ): Promise<{ valid: boolean; user: RequestUser }> {
    return { valid: true, user };
  }

  // ===== Device endpoints =====

  @Get('devices')
  @UseGuards(JwtAuthGuard)
  async getUserDevices(
    @CurrentUser() user: RequestUser,
  ): Promise<UserDeviceDto[]> {
    return this.authService.getUserDevices(user.id);
  }

  @Post('logout-device/:deviceId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutDevice(
    @CurrentUser() user: RequestUser,
    @Param('deviceId') deviceId: string,
  ): Promise<{ message: string }> {
    await this.authService.logoutDevice(user.id, deviceId);
    return { message: 'Logged out from device successfully' };
  }
}
