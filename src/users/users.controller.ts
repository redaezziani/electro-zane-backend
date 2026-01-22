import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UsersFilterDto,
  BulkDeleteDto,
  UserResponseDto,
  UsersListResponseDto,
} from './dto/users.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/permissions/permissions.enum';
import { RequestUser } from '../auth/types/auth.types';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permissions(Permission.USER_READ_ALL)
  @ApiOperation({ summary: 'Get all users with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: UsersListResponseDto,
  })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, enum: ['USER', 'ADMIN', 'MODERATOR'] })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async findAll(@Query(ValidationPipe) query: UsersFilterDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Permissions(Permission.USER_READ)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Permissions(Permission.USER_CREATE)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @Permissions(Permission.USER_UPDATE)
  @ApiOperation({ summary: 'Update user by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot update own role' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: RequestUser,
  ) {
    return this.usersService.update(id, updateUserDto, currentUser.id);
  }

  @Delete(':id')
  @Permissions(Permission.USER_DELETE)
  @ApiOperation({ summary: 'Soft delete user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot delete own account' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @CurrentUser() currentUser: RequestUser) {
    return this.usersService.remove(id, currentUser.id);
  }

  @Delete()
  @Permissions(Permission.USER_DELETE)
  @ApiOperation({ summary: 'Bulk delete users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot delete own account' })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Body(ValidationPipe) bulkDeleteDto: BulkDeleteDto,
    @CurrentUser() currentUser: RequestUser,
  ) {
    return this.usersService.bulkDelete(bulkDeleteDto.userIds, currentUser.id);
  }

  @Patch(':id/toggle-status')
  @UseGuards(PermissionsGuard)
  @Permissions(Permission.USER_TOGGLE_STATUS)
  @ApiOperation({ summary: 'Toggle user active status (Moderator and Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Moderator/Admin permission required or cannot change own status' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async toggleStatus(
    @Param('id') id: string,
    @CurrentUser() currentUser: RequestUser,
  ) {
    return this.usersService.toggleStatus(id, currentUser.id);
  }
}
