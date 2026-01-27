import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleDestroy {
  private client: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be defined');
    }

    this.client = createClient(supabaseUrl, supabaseKey);
  }

  get clientInstance(): SupabaseClient {
    return this.client;
  }

  // Users table operations
  get users() {
    return this.client.from('users');
  }

  // Customers table operations
  get customers() {
    return this.client.from('customers');
  }

  async onModuleDestroy() {
    await this.client.removeAllChannels();
  }
}
