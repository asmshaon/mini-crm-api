import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        success: boolean;
        message: string;
        data: import("../types").UserWithoutPassword;
        token: string;
    }>;
    register(registerDto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        data: import("../types").UserWithoutPassword;
        token: string;
    }>;
    logout(): Promise<{
        success: boolean;
        message: string;
    }>;
    getMe(req: Request): Promise<{
        data: import("../types").UserWithoutPassword;
    }>;
}
