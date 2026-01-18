import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY || '',
    );
  }

  async findAll(search: string, page: number, limit: number) {
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,account_number.ilike.%${search}%,phone.ilike.%${search}%,nominee.ilike.%${search}%,nid.ilike.%${search}%`,
      );
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundException('Customer not found');

    return { data };
  }

  async create(createCustomerDto: CreateCustomerDto, userId: string) {
    const customerData = {
      ...createCustomerDto,
      created_by: userId,
    };

    const { data, error } = await (this.supabase
      .from('customers') as any)
      .insert(customerData)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new ConflictException('Account number already exists');
      }
      throw error;
    }

    return { data, status: 201 };
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const { data, error } = await (this.supabase
      .from('customers') as any)
      .update(updateCustomerDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new ConflictException('Account number already exists');
      }
      throw error;
    }

    if (!data) throw new NotFoundException('Customer not found');

    return { data };
  }

  async remove(id: string) {
    const { error } = await this.supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  }

  async import(file: Express.Multer.File, userId: string) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      throw new Error('File is empty');
    }

    let success = 0;
    let failed = 0;
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as Record<string, unknown>;
      const rowNum = i + 2;

      try {
        const name = row.name || row.Name;
        const accountNumber = row.account_number || row.accountNumber || row['Account Number'];
        const phone = row.phone || row.Phone;

        if (!name || !accountNumber || !phone) {
          errors.push({
            row: rowNum,
            error: 'Missing required fields (name, account_number, phone)',
          });
          failed++;
          continue;
        }

        const customerData = {
          name: String(name),
          account_number: String(accountNumber),
          phone: String(phone),
          nominee: row.nominee ? String(row.nominee) : null,
          nid: row.nid || row.NID ? String(row.nid || row.NID) : null,
          status: (row.status as 'active' | 'inactive' | 'lead') || 'active',
          notes: row.notes || row.Notes ? String(row.notes || row.Notes) : null,
          created_by: userId,
        };

        const { error } = await (this.supabase
          .from('customers') as any)
          .insert(customerData);

        if (error) {
          if (error.code === '23505') {
            errors.push({
              row: rowNum,
              error: `Account number ${accountNumber} already exists`,
            });
          } else {
            errors.push({
              row: rowNum,
              error: error.message,
            });
          }
          failed++;
        } else {
          success++;
        }
      } catch (err) {
        errors.push({
          row: rowNum,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
        failed++;
      }
    }

    return {
      success,
      failed,
      errors,
      total: jsonData.length,
    };
  }
}
