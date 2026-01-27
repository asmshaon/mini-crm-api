import { OnModuleDestroy } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class SupabaseService implements OnModuleDestroy {
    private client;
    constructor();
    get clientInstance(): SupabaseClient;
    get users(): import("@supabase/postgrest-js").PostgrestQueryBuilder<any, any, any, "users", unknown>;
    get customers(): import("@supabase/postgrest-js").PostgrestQueryBuilder<any, any, any, "customers", unknown>;
    onModuleDestroy(): Promise<void>;
}
