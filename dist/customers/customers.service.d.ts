import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { SupabaseService } from "../supabase/supabase.service";
import { Customer, PaginatedResponse } from "../types";
export declare class CustomersService {
    private supabase;
    constructor(supabase: SupabaseService);
    findAll(search: string, page: number, limit: number, token: string): Promise<PaginatedResponse<Customer>>;
    findOne(id: string, token: string): Promise<{
        data: Customer;
    }>;
    create(createCustomerDto: CreateCustomerDto, userId: string, token: string): Promise<{
        data: Customer;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, token: string): Promise<{
        data: Customer;
    }>;
    remove(id: string, token: string): Promise<{
        success: boolean;
    }>;
    import(file: Express.Multer.File, userId: string, token: string): Promise<{
        success: number;
        failed: number;
        errors: Array<{
            row: number;
            error: string;
        }>;
        total: number;
    }>;
    uploadPhoto(file: Express.Multer.File): Promise<{
        url: string;
        path: string;
    }>;
}
