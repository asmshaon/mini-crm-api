import { CustomerStatus } from '../../types';
export declare class CreateCustomerDto {
    name: string;
    account_number: string;
    phone: string;
    nominee?: string;
    nid?: string;
    status?: CustomerStatus;
    notes?: string;
}
