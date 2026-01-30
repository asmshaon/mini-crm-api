export interface User {
    id: string;
    email: string;
    password: string;
    name: string | null;
    created_at: string;
    updated_at: string;
}
export type UserWithoutPassword = Omit<User, 'password'>;
export declare enum CustomerStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    LEAD = "lead"
}
export interface Customer {
    id: string;
    name: string;
    accountNumber: string;
    phone: string;
    nominee: string | null;
    nid: string | null;
    status: CustomerStatus;
    notes: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
}
export interface PaginationParams {
    search?: string;
    page?: number;
    limit?: number;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface SupabaseResponse<T> {
    data: T | null;
    error: any | null;
}
export interface SupabaseListResponse<T> {
    data: T[] | null;
    error: any | null;
    count: number | null;
}
