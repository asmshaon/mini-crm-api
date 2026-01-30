import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { SupabaseService } from "../supabase/supabase.service";
import { Customer, PaginatedResponse } from "../types";
export declare class CustomersService {
    private supabase;
    constructor(supabase: SupabaseService);
    private transformCustomer;
    private transformCustomers;
    findAll(search: string, page: number, limit: number): Promise<PaginatedResponse<Customer>>;
    findOne(id: string): Promise<{
        data: Customer;
    }>;
    create(createCustomerDto: CreateCustomerDto, userId: string): Promise<{
        data: Customer;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<{
        data: Customer;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    import(file: Express.Multer.File, userId: string): Promise<{
        success: number;
        failed: number;
        errors: Array<{
            row: number;
            error: string;
        }>;
        total: number;
    }>;
}
