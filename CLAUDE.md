# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the NestJS backend.

## Module Structure

```
src/
├── auth/              # Authentication (JWT-based)
│   ├── dto/           # LoginDto, RegisterDto
│   ├── guards/        # JwtAuthGuard, SessionGuard
│   ├── auth.controller.ts
│   └── auth.service.ts
├── customers/         # Customer CRUD operations
│   ├── dto/           # CreateCustomerDto, UpdateCustomerDto
│   ├── customers.controller.ts
│   └── customers.service.ts
├── supabase/          # Global database service
│   └── supabase.service.ts
├── config/            # Configuration files
├── types/             # Shared TypeScript types
├── app.module.ts      # Root module
└── main.ts            # Entry point
```

## Key Patterns

### Controllers

Handle HTTP requests/responses. Use decorators:

- `@Get()`, `@Post()`, `@Put()`, `@Delete()` for routes
- `@UseGuards(JwtAuthGuard)` for protected routes
- `@Request()` to access the request object with `user` payload

### Services

Contain business logic. Inject `SupabaseService` for database operations:

```typescript
constructor(private supabase: SupabaseService) {}

// Access tables
this.supabase.users.select("*")
this.supabase.customers.insert({...})
```

### DTOs

Validate incoming data using `class-validator` decorators:

```typescript
export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
```

### Guards

- `JwtAuthGuard` - Validates JWT from `Authorization: Bearer <token>` header
- Sets `request.user` with payload `{ sub: userId, email }`

## Authentication Flow

1. **Register**: `POST /auth/register` → Creates user, returns JWT
2. **Login**: `POST /auth/login` → Validates credentials, returns JWT
3. **Protected Routes**: Include `Authorization: Bearer <token>` header
4. **JWT Payload**: `{ sub: user.id, email: user.email }`
5. **Token Expiration**: 7 days (configurable via `JWT_SECRET` env var)

## Database Operations

### SupabaseService Usage

```typescript
// Select with filters
const { data, error } = await this.supabase.customers
  .select("*")
  .eq("id", id)
  .single();

// Insert
const { data, error } = await this.supabase.customers
  .insert({...})
  .select("*")
  .single();

// Update
const { data, error } = await this.supabase.customers
  .update({...})
  .eq("id", id)
  .select("*")
  .single();

// Delete
const { error } = await this.supabase.customers
  .delete()
  .eq("id", id);

// Case-insensitive search (uses Postgres ilike)
const { data } = await this.supabase.customers
  .select("*")
  .or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
```

## Error Handling

```typescript
// Not found
throw new NotFoundException("Customer not found");

// Conflict (duplicate)
throw new ConflictException("Account number already exists");

// Unauthorized
throw new UnauthorizedException("Invalid credentials");

// Generic
throw new Error(`Failed to create customer: ${error.message}`);
```

## File Upload (Excel/CSV Import)

Customers module supports bulk import via `POST /customers/import`:

- Uses Multer with memory storage
- Max file size: 5MB
- Supported formats: .xlsx, .csv
- Required columns: `name`, `account_number`, `phone`
- Optional columns: `nominee`, `nid`, `status`, `notes`

## Environment Variables

```
PORT=3001
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=...
JWT_SECRET=...
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Adding New Features

1. Create module: `nest g module features`
2. Create controller: `nest g controller features`
3. Create service: `nest g service features`
4. Create DTOs in `dto/` folder
5. Import module in `app.module.ts`
6. Add `@UseGuards(JwtAuthGuard)` to protected endpoints
