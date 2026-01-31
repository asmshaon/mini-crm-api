import { Request } from 'express';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    findAll(search: string, page: string, limit: string, req: Request): Promise<import("../types").PaginatedResponse<import("../types").Customer>>;
    findOne(id: string, req: Request): Promise<{
        data: import("../types").Customer;
    }>;
    create(createCustomerDto: CreateCustomerDto, req: Request): Promise<{
        data: import("../types").Customer;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto, req: Request): Promise<{
        data: import("../types").Customer;
    }>;
    remove(id: string, req: Request): Promise<{
        success: boolean;
    }>;
    import(file: Express.Multer.File, req: Request): Promise<{
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
