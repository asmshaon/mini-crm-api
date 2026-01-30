"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const XLSX = __importStar(require("xlsx"));
const supabase_service_1 = require("../supabase/supabase.service");
let CustomersService = class CustomersService {
    constructor(supabase) {
        this.supabase = supabase;
    }
    async findAll(search, page, limit) {
        const skip = (page - 1) * limit;
        let query = this.supabase.customers.select("*", { count: "exact" });
        if (search) {
            query = query.or(`name.ilike.%${search}%,account_number.ilike.%${search}%,phone.ilike.%${search}%,nominee.ilike.%${search}%,nid.ilike.%${search}%`);
        }
        const { data, error, count } = await query
            .order("created_at", { ascending: false })
            .range(skip, skip + limit - 1);
        if (error) {
            throw new Error(`Failed to fetch customers: ${error.message}`);
        }
        return {
            data: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        };
    }
    async findOne(id) {
        const { data, error } = await this.supabase.customers
            .select("*")
            .eq("id", id)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException("Customer not found");
        }
        return { data };
    }
    async create(createCustomerDto, userId) {
        const { data, error } = await this.supabase.customers
            .insert({
            ...createCustomerDto,
            created_by: userId,
        })
            .select("*")
            .single();
        if (error) {
            if (error.code === "23505") {
                throw new common_1.ConflictException("Account number already exists");
            }
            throw new Error(`Failed to create customer: ${error.message}`);
        }
        return { data };
    }
    async update(id, updateCustomerDto) {
        const { data: existing } = await this.supabase.customers
            .select("id")
            .eq("id", id)
            .single();
        if (!existing) {
            throw new common_1.NotFoundException("Customer not found");
        }
        const { data, error } = await this.supabase.customers
            .update(updateCustomerDto)
            .eq("id", id)
            .select("*")
            .single();
        if (error) {
            if (error.code === "23505") {
                throw new common_1.ConflictException("Account number already exists");
            }
            throw new Error(`Failed to update customer: ${error.message}`);
        }
        return { data };
    }
    async remove(id) {
        const { error } = await this.supabase.customers.delete().eq("id", id);
        if (error) {
            throw new common_1.NotFoundException("Customer not found");
        }
        return { success: true };
    }
    async import(file, userId) {
        const workbook = XLSX.read(file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        if (jsonData.length === 0) {
            throw new Error("File is empty");
        }
        let successCount = 0;
        let failedCount = 0;
        const errors = [];
        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            const rowNum = i + 2;
            try {
                const name = row.name || row.Name;
                const account_number = row.account_number || row.account_number || row["Account Number"];
                const phone = row.phone || row.Phone;
                if (!name || !account_number || !phone) {
                    errors.push({
                        row: rowNum,
                        error: "Missing required fields (name, account_number, phone)",
                    });
                    failedCount++;
                    continue;
                }
                const { error } = await this.supabase.customers.insert({
                    name: String(name),
                    account_number: String(account_number),
                    phone: String(phone),
                    nominee: row.nominee ? String(row.nominee) : null,
                    nid: row.nid || row.NID ? String(row.nid || row.NID) : null,
                    status: row.status || "active",
                    notes: row.notes || row.Notes ? String(row.notes || row.Notes) : null,
                    created_by: userId,
                });
                if (error) {
                    const errorMessage = error.code === "23505"
                        ? `Account number ${account_number} already exists`
                        : error.message;
                    errors.push({
                        row: rowNum,
                        error: errorMessage,
                    });
                    failedCount++;
                }
                else {
                    successCount++;
                }
            }
            catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Unknown error";
                errors.push({
                    row: rowNum,
                    error: errorMessage,
                });
                failedCount++;
            }
        }
        return {
            success: successCount,
            failed: failedCount,
            errors,
            total: jsonData.length,
        };
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map