import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleDestroy {
  private serviceClient: SupabaseClient;
  private supabaseUrl: string;
  private supabaseAnonKey: string;

  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL!;
    this.supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!this.supabaseUrl || !this.supabaseAnonKey || !serviceKey) {
      throw new Error('SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_KEY must be defined');
    }

    // Service client bypasses RLS (use sparingly, e.g., storage operations)
    this.serviceClient = createClient(this.supabaseUrl, serviceKey);
  }

  /**
   * Create a client with user's JWT token - RLS policies will be enforced
   */
  createClientWithAuth(token: string): SupabaseClient {
    return createClient(this.supabaseUrl, this.supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }

  /**
   * Get the service client (bypasses RLS - use carefully)
   * Only use for operations that need elevated privileges
   */
  get serviceClientInstance(): SupabaseClient {
    return this.serviceClient;
  }

  // Users table operations
  get users() {
    return this.serviceClient.from('users');
  }

  // Customers table operations
  get customers() {
    return this.serviceClient.from('customers');
  }

  // Storage operations
  get storage() {
    return this.serviceClient.storage;
  }

  async onModuleDestroy() {
    await this.serviceClient.removeAllChannels();
  }
}
