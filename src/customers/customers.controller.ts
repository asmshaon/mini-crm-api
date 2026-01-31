import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';

@Controller('customers')
@UseGuards(SupabaseAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async findAll(
    @Query('search') search: string = '',
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Req() req: Request,
  ) {
    const token = req['token'];
    return this.customersService.findAll(
      search,
      parseInt(page),
      parseInt(limit),
      token,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const token = req['token'];
    return this.customersService.findOne(id, token);
  }

  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto, @Req() req: Request) {
    const token = req['token'];
    const userId = req['user'].sub;
    return this.customersService.create(createCustomerDto, userId, token);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto, @Req() req: Request) {
    const token = req['token'];
    return this.customersService.update(id, updateCustomerDto, token);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const token = req['token'];
    return this.customersService.remove(id, token);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async import(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    if (!validTypes.includes(file.mimetype) && !file.originalname.endsWith('.csv')) {
      throw new BadRequestException('Invalid file type. Please upload .xlsx, .xls, or .csv');
    }

    const token = req['token'];
    const userId = req['user'].sub;
    return this.customersService.import(file, userId, token);
  }

  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.customersService.uploadPhoto(file);
  }
}
