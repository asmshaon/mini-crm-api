import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  account_number: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  nominee?: string;

  @IsString()
  @IsOptional()
  nid?: string;

  @IsEnum(['active', 'inactive', 'lead'])
  @IsOptional()
  status?: 'active' | 'inactive' | 'lead';

  @IsString()
  @IsOptional()
  notes?: string;
}
