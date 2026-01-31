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
exports.SupabaseService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
let SupabaseService = class SupabaseService {
    constructor() {
        this.supabaseUrl = process.env.SUPABASE_URL;
        this.supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
        const serviceKey = process.env.SUPABASE_SERVICE_KEY;
        if (!this.supabaseUrl || !this.supabaseAnonKey || !serviceKey) {
            throw new Error('SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_KEY must be defined');
        }
        this.serviceClient = (0, supabase_js_1.createClient)(this.supabaseUrl, serviceKey);
    }
    createClientWithAuth(token) {
        return (0, supabase_js_1.createClient)(this.supabaseUrl, this.supabaseAnonKey, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        });
    }
    get serviceClientInstance() {
        return this.serviceClient;
    }
    get users() {
        return this.serviceClient.from('users');
    }
    get customers() {
        return this.serviceClient.from('customers');
    }
    get storage() {
        return this.serviceClient.storage;
    }
    async onModuleDestroy() {
        await this.serviceClient.removeAllChannels();
    }
};
exports.SupabaseService = SupabaseService;
exports.SupabaseService = SupabaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SupabaseService);
//# sourceMappingURL=supabase.service.js.map