import { CustomerStatus } from '../../types';
export declare class CreateCustomerDto {
    name: string;
    accountNumber: string;
    phone: string;
    nominee?: string;
    nid?: string;
    status?: CustomerStatus;
    notes?: string;
}
