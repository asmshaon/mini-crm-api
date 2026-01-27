import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { SupabaseService } from "../supabase/supabase.service";
import { User, UserWithoutPassword } from "../types";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private supabase: SupabaseService,
  ) {}

  async login(loginDto: LoginDto): Promise<{
    token: string;
    user: UserWithoutPassword;
  }> {
    const { email, password } = loginDto;

    const { data: user, error } = await this.supabase.users
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user || user.password !== password) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return {
      token,
      user: userWithoutPassword,
    };
  }

  async register(registerDto: RegisterDto): Promise<{
    token: string;
    user: UserWithoutPassword;
  }> {
    const { email, password, name } = registerDto;

    // Check if user exists
    const { data: existingUser } = await this.supabase.users
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      throw new ConflictException("User already exists");
    }

    // Create new user
    const { data: user, error } = await this.supabase.users
      .insert({
        email,
        password,
        name: name || null,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    const { password: _, ...userWithoutPassword } = user;
    return {
      token,
      user: userWithoutPassword,
    };
  }

  logout(): { message: string } {
    return { message: "Logout successful" };
  }

  async getMe(userId: string): Promise<UserWithoutPassword> {
    const { data: user, error } = await this.supabase.users
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !user) {
      throw new UnauthorizedException("Invalid session");
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async verifyToken(token: string): Promise<{ sub: string; email: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return payload;
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
