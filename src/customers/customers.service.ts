import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import * as XLSX from "xlsx";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { SupabaseService } from "../supabase/supabase.service";
import { Customer, CustomerStatus, PaginatedResponse } from "../types";

@Injectable()
export class CustomersService {
  constructor(private supabase: SupabaseService) {}

  async findAll(
    search: string,
    page: number,
    limit: number,
    token: string,
  ): Promise<PaginatedResponse<Customer>> {
    const skip = (page - 1) * limit;
    const client = this.supabase.createClientWithAuth(token);

    let query = client.from("customers").select("*", { count: "exact" });

    if (search) {
      // Use Supabase's or filter for case-insensitive search
      query = query.or(
        `name.ilike.%${search}%,account_number.ilike.%${search}%,phone.ilike.%${search}%,nominee.ilike.%${search}%,nid.ilike.%${search}%`,
      );
    }

    // Get paginated data (RLS filters by created_by automatically)
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async findOne(id: string, token: string): Promise<{ data: Customer }> {
    const client = this.supabase.createClientWithAuth(token);
    const { data, error } = await client
      .from("customers")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      throw new NotFoundException("Customer not found");
    }

    return { data };
  }

  async create(
    createCustomerDto: CreateCustomerDto,
    userId: string,
    token: string,
  ): Promise<{
    data: Customer;
  }> {
    const client = this.supabase.createClientWithAuth(token);
    const { data, error } = await client
      .from("customers")
      .insert({
        ...createCustomerDto,
        created_by: userId,
      })
      .select("*")
      .single();

    if (error) {
      // Check for unique constraint violation (account_number)
      if (error.code === "23505") {
        throw new ConflictException("Account number already exists");
      }
      throw new Error(`Failed to create customer: ${error.message}`);
    }

    return { data };
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
    token: string,
  ): Promise<{
    data: Customer;
  }> {
    const client = this.supabase.createClientWithAuth(token);
    const { data, error } = await client
      .from("customers")
      .update(updateCustomerDto)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new ConflictException("Account number already exists");
      }
      throw new NotFoundException("Customer not found");
    }

    return { data };
  }

  async remove(id: string, token: string): Promise<{ success: boolean }> {
    const client = this.supabase.createClientWithAuth(token);
    const { error } = await client.from("customers").delete().eq("id", id);

    if (error) {
      throw new NotFoundException("Customer not found");
    }

    return { success: true };
  }

  async import(
    file: Express.Multer.File,
    userId: string,
    token: string,
  ): Promise<{
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
    total: number;
  }> {
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    const client = this.supabase.createClientWithAuth(token);

    if (jsonData.length === 0) {
      throw new Error("File is empty");
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as Record<string, unknown>;
      const rowNum = i + 2;

      try {
        const name = row.name || row.Name;
        const account_number =
          row.account_number || row.account_number || row["Account Number"];
        const phone = row.phone || row.Phone;

        if (!name || !account_number || !phone) {
          errors.push({
            row: rowNum,
            error: "Missing required fields (name, account_number, phone)",
          });
          failedCount++;
          continue;
        }

        const { error } = await client.from("customers").insert({
          name: String(name),
          account_number: String(account_number),
          phone: String(phone),
          nominee: row.nominee ? String(row.nominee) : null,
          nid: row.nid || row.NID ? String(row.nid || row.NID) : null,
          status: (row.status as CustomerStatus) || "active",
          notes: row.notes || row.Notes ? String(row.notes || row.Notes) : null,
          created_by: userId,
        });

        if (error) {
          const errorMessage =
            error.code === "23505"
              ? `Account number ${account_number} already exists`
              : error.message;

          errors.push({
            row: rowNum,
            error: errorMessage,
          });
          failedCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";

        errors.push({
          row: rowNum,
          error: errorMessage,
        });
        failedCount++;
      }
    }

    return {
      success: successCount,
      failed: failedCount,
      errors,
      total: jsonData.length,
    };
  }

  async uploadPhoto(
    file: Express.Multer.File,
  ): Promise<{ url: string; path: string }> {
    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        "Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.",
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException("File size exceeds 5MB limit.");
    }

    // Generate unique filename
    const fileExt = file.originalname.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `customer-photos/${fileName}`;

    // Upload to Supabase Storage
    const { error } = await this.supabase.storage
      .from("customer-photos")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new BadRequestException(`Failed to upload photo: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from("customer-photos")
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath,
    };
  }
}
