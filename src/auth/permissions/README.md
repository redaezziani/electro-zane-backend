# Database-Driven Permissions System

This system allows you to manage role-based permissions from the UI. Permissions are stored in the database and can be modified at runtime without code changes.

## Features

- ✅ **Database-driven**: Permissions stored in PostgreSQL
- ✅ **Cached**: 5-minute cache for performance
- ✅ **Hot-reload**: Changes take effect immediately after cache refresh
- ✅ **UI manageable**: Full REST API for permission management
- ✅ **Type-safe**: Uses TypeScript enums for compile-time safety

## Setup

### 1. Run Migration

```bash
cd backend
npx prisma migrate dev --name add_role_permissions
```

### 2. Seed Default Permissions

```bash
npx ts-node src/database/seeders/permissions.seeder.ts
```

Or add to your main seeder file.

## Usage in Controllers

### Using the Permissions Decorator

```typescript
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/permissions/permissions.enum';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@Controller('products')
@UseGuards(JwtAuthGuard) // Authentication required
export class ProductsController {

  // Require ANY of the listed permissions
  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.PRODUCT_CREATE)
  async create() {
    // Only users with PRODUCT_CREATE permission can access
  }

  // Require ALL listed permissions
  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequireAllPermissions(Permission.PRODUCT_DELETE, Permission.PRODUCT_UPDATE)
  async delete() {
    // User must have BOTH permissions
  }
}
```

## API Endpoints (Admin Only)

All permission management endpoints require **ADMIN** role.

### Get All Available Permissions
```http
GET /permissions/available
```

Response:
```json
{
  "permissions": [
    "product:create",
    "product:read",
    "product:update",
    "product:delete",
    ...
  ]
}
```

### Get Permissions for a Role
```http
GET /permissions/roles/MODERATOR
```

Response:
```json
{
  "role": "MODERATOR",
  "permissions": [
    "product:create",
    "product:read",
    ...
  ]
}
```

### Get All Role Permissions
```http
GET /permissions/roles
```

Response:
```json
{
  "ADMIN": ["product:create", "product:read", ...],
  "MODERATOR": ["product:create", "product:read", ...],
  "USER": ["product:read", ...]
}
```

### Set All Permissions for a Role
```http
POST /permissions/roles/MODERATOR
Content-Type: application/json

{
  "permissions": [
    "product:create",
    "product:read",
    "order:create"
  ]
}
```

This **replaces** all existing permissions for the role.

### Add Single Permission to Role
```http
POST /permissions/add
Content-Type: application/json

{
  "role": "MODERATOR",
  "permission": "user:toggle_status"
}
```

### Remove Single Permission from Role
```http
DELETE /permissions/remove
Content-Type: application/json

{
  "role": "MODERATOR",
  "permission": "user:toggle_status"
}
```

### Refresh Cache
```http
POST /permissions/refresh-cache
```

Forces an immediate cache refresh. Useful after bulk updates.

## Example: Remove USER_TOGGLE_STATUS from ADMIN via API

```bash
curl -X DELETE http://localhost:8085/permissions/remove \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "ADMIN",
    "permission": "user:toggle_status"
  }'
```

## How It Works

1. **Database Storage**: `RolePermission` table stores which permissions each role has
2. **Caching**: Permissions loaded on app start and cached for 5 minutes
3. **Guard Check**: `PermissionsGuard` checks user's role against required permissions
4. **Auto-refresh**: Cache automatically refreshes every 5 minutes or on manual refresh

## Database Schema

```prisma
model RolePermission {
  id         String   @id @default(uuid())
  role       UserRole
  permission String   @db.VarChar(100)
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([role, permission])
}
```

## Permission Enum

All available permissions are defined in [permissions.enum.ts](./permissions.enum.ts):

- `PRODUCT_*` - Product management
- `CATEGORY_*` - Category management
- `ORDER_*` - Order management
- `USER_*` - User management
- `PAYMENT_*` - Payment processing
- `INVENTORY_*` - Inventory management
- `ANALYTICS_*` - Analytics access
- `SETTINGS_*` - System settings
- `REVIEW_*` - Review management

## Performance

- **First request**: ~50ms (cache miss, loads from DB)
- **Cached requests**: ~1ms (in-memory lookup)
- **Cache TTL**: 5 minutes
- **Manual refresh**: Available via API endpoint

## Security Notes

- Only **ADMIN** users can modify permissions
- Permission changes require cache refresh to take effect
- Cache auto-refreshes every 5 minutes
- All permission checks are done server-side
