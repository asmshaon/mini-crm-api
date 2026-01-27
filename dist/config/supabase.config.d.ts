import { SupabaseClient } from '@supabase/supabase-js';
export declare class SupabaseConfig {
    private client;
    constructor();
    get supabase(): SupabaseClient;
}
