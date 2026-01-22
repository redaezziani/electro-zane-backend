import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { IsArray, IsEnum, IsString } from 'class-validator';
import { UserRole } from '@prisma/client';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Permission } from './permissions.enum';

class AddPermissionDto {
  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  permission: string;
}

class SetRolePermissionsDto {
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}

class RemovePermissionDto {
  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  permission: string;
}

@ApiTags('Permissions Management')
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN) // Only admins can manage permissions
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('available')
  @ApiOperation({ summary: 'Get all available permissions' })
  @ApiResponse({
    status: 200,
    description: 'List of all available permissions',
    schema: {
      type: 'object',
      properties: {
        permissions: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  getAvailablePermissions() {
    return {
      permissions: Object.values(Permission),
    };
  }

  @Get('roles/:role')
  @ApiOperation({ summary: 'Get permissions for a specific role' })
  @ApiParam({ name: 'role', enum: UserRole })
  @ApiResponse({
    status: 200,
    description: 'Permissions for the role',
    schema: {
      type: 'object',
      properties: {
        role: { type: 'string' },
        permissions: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  async getRolePermissions(@Param('role') role: UserRole) {
    const permissions = await this.permissionsService.getRolePermissions(role);
    return {
      role,
      permissions,
    };
  }

  @Get('roles')
  @ApiOperation({ summary: 'Get all permissions for all roles' })
  @ApiResponse({
    status: 200,
    description: 'All role permissions',
    schema: {
      type: 'object',
      properties: {
        ADMIN: {
          type: 'array',
          items: { type: 'string' },
        },
        MODERATOR: {
          type: 'array',
          items: { type: 'string' },
        },
        USER: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  async getAllRolePermissions() {
    return this.permissionsService.getAllRolePermissions();
  }

  @Post('roles/:role')
  @ApiOperation({ summary: 'Set all permissions for a role (replaces existing)' })
  @ApiParam({ name: 'role', enum: UserRole })
  @ApiBody({
    description: 'Array of permissions to set for the role',
    type: SetRolePermissionsDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        role: { type: 'string' },
        permissionsCount: { type: 'number' },
      },
    },
  })
  async setRolePermissions(
    @Param('role') role: UserRole,
    @Body() dto: SetRolePermissionsDto,
  ) {
    await this.permissionsService.setRolePermissions(role, dto.permissions);
    return {
      message: 'Permissions updated successfully',
      role,
      permissionsCount: dto.permissions.length,
    };
  }

  @Post('add')
  @ApiOperation({ summary: 'Add a permission to a role' })
  @ApiBody({ type: AddPermissionDto })
  @ApiResponse({
    status: 201,
    description: 'Permission added successfully',
  })
  async addPermission(@Body() dto: AddPermissionDto) {
    await this.permissionsService.addPermission(dto.role, dto.permission);
    return {
      message: 'Permission added successfully',
      role: dto.role,
      permission: dto.permission,
    };
  }

  @Delete('remove')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a permission from a role' })
  @ApiBody({ type: RemovePermissionDto })
  @ApiResponse({
    status: 200,
    description: 'Permission removed successfully',
  })
  async removePermission(@Body() dto: RemovePermissionDto) {
    await this.permissionsService.removePermission(dto.role, dto.permission);
    return {
      message: 'Permission removed successfully',
      role: dto.role,
      permission: dto.permission,
    };
  }

  @Post('refresh-cache')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually refresh the permissions cache' })
  @ApiResponse({
    status: 200,
    description: 'Cache refreshed successfully',
  })
  async refreshCache() {
    await this.permissionsService.refreshCache();
    return {
      message: 'Permissions cache refreshed successfully',
    };
  }
}
