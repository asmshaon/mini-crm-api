import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { CustomerStatus } from '../../types';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  nominee?: string;

  @IsString()
  @IsOptional()
  nid?: string;

  @IsEnum(CustomerStatus)
  @IsOptional()
  status?: CustomerStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
