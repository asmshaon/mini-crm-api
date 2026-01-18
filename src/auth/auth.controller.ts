import { Controller, Post, Get, Body, Res, Req, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SessionGuard } from './guards/session.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const user = await this.authService.login(loginDto, res);
    return res.json({
      success: true,
      message: 'Login successful',
      data: user,
    });
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const user = await this.authService.register(registerDto, res);
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: user,
    });
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    await this.authService.logout(res);
    return res.json({
      success: true,
      message: 'Logout successful',
    });
  }

  @UseGuards(SessionGuard)
  @Get('me')
  async getMe(@Req() req: Request, @Res() res: Response) {
    const user = await this.authService.getMe(req.cookies['session']);
    return res.json({ data: user });
  }
}
