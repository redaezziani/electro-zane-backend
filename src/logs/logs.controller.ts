import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LogsService } from './logs.service';
import { QueryLogsDto, LogType } from './dto/query-logs.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Logs')
@Controller('logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MODERATOR)
@ApiBearerAuth()
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get logs with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Logs retrieved successfully' })
  async getLogs(@Query() query: QueryLogsDto): Promise<any> {
    return this.logsService.getLogs(query);
  }

  @Get('dates')
  @ApiOperation({ summary: 'Get available log dates' })
  @ApiResponse({ status: 200, description: 'Available dates retrieved successfully' })
  async getAvailableDates(@Query('type') type?: LogType): Promise<string[]> {
    return this.logsService.getAvailableDates(type);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get log statistics for a specific date' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getLogStats(@Query('date') date?: string): Promise<any> {
    return this.logsService.getLogStats(date);
  }
}
