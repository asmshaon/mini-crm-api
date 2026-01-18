import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY || '',
    );
  }

  async login(loginDto: LoginDto, res: Response) {
    const { email, password } = loginDto;

    const { data: user, error } = await (this.supabase
      .from('users') as any)
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.password !== password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    res.cookie('session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
      path: '/',
    });

    const { password: _, ...userWithoutPassword } = user as any;
    return userWithoutPassword;
  }

  async register(registerDto: RegisterDto, res: Response) {
    const { email, password, name } = registerDto;

    const { data: existingUser } = await (this.supabase
      .from('users') as any)
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const newUser = {
      email,
      password,
      name: name || null,
    };

    const { data: user, error } = await (this.supabase
      .from('users') as any)
      .insert(newUser)
      .select()
      .single();

    if (error || !user) {
      throw new Error('Failed to create account');
    }

    res.cookie('session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
      path: '/',
    });

    const { password: _, ...userWithoutPassword } = user as any;
    return userWithoutPassword;
  }

  async logout(res: Response) {
    res.clearCookie('session', {
      path: '/',
    });
    return { message: 'Logout successful' };
  }

  async getMe(sessionId: string) {
    const { data: user, error } = await (this.supabase
      .from('users') as any)
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('Invalid session');
    }

    const { password: _, ...userWithoutPassword } = user as any;
    return userWithoutPassword;
  }
}
