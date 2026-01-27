import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { SupabaseService } from "../supabase/supabase.service";
import { UserWithoutPassword } from "../types";
export declare class AuthService {
    private jwtService;
    private supabase;
    constructor(jwtService: JwtService, supabase: SupabaseService);
    login(loginDto: LoginDto): Promise<{
        token: string;
        user: UserWithoutPassword;
    }>;
    register(registerDto: RegisterDto): Promise<{
        token: string;
        user: UserWithoutPassword;
    }>;
    logout(): {
        message: string;
    };
    getMe(userId: string): Promise<UserWithoutPassword>;
    verifyToken(token: string): Promise<{
        sub: string;
        email: string;
    }>;
}
