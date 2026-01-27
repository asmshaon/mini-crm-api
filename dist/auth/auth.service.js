"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const supabase_service_1 = require("../supabase/supabase.service");
let AuthService = class AuthService {
    constructor(jwtService, supabase) {
        this.jwtService = jwtService;
        this.supabase = supabase;
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const { data: user, error } = await this.supabase.users
            .select("*")
            .eq("email", email)
            .single();
        if (error || !user || user.password !== password) {
            throw new common_1.UnauthorizedException("Invalid email or password");
        }
        const token = this.jwtService.sign({ sub: user.id, email: user.email });
        const { password: _, ...userWithoutPassword } = user;
        return {
            token,
            user: userWithoutPassword,
        };
    }
    async register(registerDto) {
        const { email, password, name } = registerDto;
        const { data: existingUser } = await this.supabase.users
            .select("id")
            .eq("email", email)
            .single();
        if (existingUser) {
            throw new common_1.ConflictException("User already exists");
        }
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
    logout() {
        return { message: "Logout successful" };
    }
    async getMe(userId) {
        const { data: user, error } = await this.supabase.users
            .select("*")
            .eq("id", userId)
            .single();
        if (error || !user) {
            throw new common_1.UnauthorizedException("Invalid session");
        }
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    async verifyToken(token) {
        try {
            const payload = await this.jwtService.verifyAsync(token);
            return payload;
        }
        catch {
            throw new common_1.UnauthorizedException("Invalid token");
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        supabase_service_1.SupabaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map