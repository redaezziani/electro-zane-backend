import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SettingResponseDto } from './dto/setting-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/permissions/permissions.enum';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @Permissions(Permission.SETTINGS_UPDATE)
  @ApiOperation({ summary: 'Create a new setting' })
  @ApiResponse({
    status: 201,
    description: 'Setting created successfully',
    type: SettingResponseDto,
  })
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @Get()
  @Permissions(Permission.SETTINGS_READ)
  @ApiOperation({ summary: 'Get all settings' })
  @ApiResponse({
    status: 200,
    description: 'Settings retrieved successfully',
    type: [SettingResponseDto],
  })
  findAll() {
    return this.settingsService.findAll();
  }

  @Get(':key')
  @Permissions(Permission.SETTINGS_READ)
  @ApiOperation({ summary: 'Get a setting by key' })
  @ApiResponse({
    status: 200,
    description: 'Setting retrieved successfully',
    type: SettingResponseDto,
  })
  findOne(@Param('key') key: string) {
    return this.settingsService.findOne(key);
  }

  @Patch(':key')
  @Permissions(Permission.SETTINGS_UPDATE)
  @ApiOperation({ summary: 'Update a setting' })
  @ApiResponse({
    status: 200,
    description: 'Setting updated successfully',
    type: SettingResponseDto,
  })
  update(
    @Param('key') key: string,
    @Body() updateSettingDto: UpdateSettingDto,
  ) {
    return this.settingsService.update(key, updateSettingDto);
  }

  @Delete(':key')
  @Permissions(Permission.SETTINGS_UPDATE)
  @ApiOperation({ summary: 'Delete a setting' })
  @ApiResponse({ status: 204, description: 'Setting deleted successfully' })
  remove(@Param('key') key: string) {
    return this.settingsService.remove(key);
  }
}
