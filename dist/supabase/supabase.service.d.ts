import { OnModuleDestroy } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class SupabaseService implements OnModuleDestroy {
    private serviceClient;
    private supabaseUrl;
    private supabaseAnonKey;
    constructor();
    createClientWithAuth(token: string): SupabaseClient;
    get serviceClientInstance(): SupabaseClient;
    get users(): import("@supabase/postgrest-js").PostgrestQueryBuilder<any, any, any, "users", unknown>;
    get customers(): import("@supabase/postgrest-js").PostgrestQueryBuilder<any, any, any, "customers", unknown>;
    get storage(): import("@supabase/storage-js").StorageClient;
    onModuleDestroy(): Promise<void>;
}
