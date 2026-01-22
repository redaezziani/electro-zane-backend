import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum LogType {
  ACTIVITY = 'activity',
  ERROR = 'error',
  COMBINED = 'combined',
}

export enum LogAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  CANCEL = 'CANCEL',
  REFUND = 'REFUND',
  RESTORE = 'RESTORE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
}

export class QueryLogsDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @ApiProperty({ required: false, enum: LogType, default: LogType.ACTIVITY })
  @IsOptional()
  @IsEnum(LogType)
  type?: LogType = LogType.ACTIVITY;

  @ApiProperty({ required: false, description: 'Date in YYYY-MM-DD format' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({ required: false, description: 'Search in log messages' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, description: 'Filter by user ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ required: false, enum: LogAction })
  @IsOptional()
  @IsEnum(LogAction)
  action?: LogAction;

  @ApiProperty({ required: false, description: 'Filter by entity type (e.g., Order, Product)' })
  @IsOptional()
  @IsString()
  entity?: string;

  @ApiProperty({ required: false, description: 'Filter by entity ID' })
  @IsOptional()
  @IsString()
  entityId?: string;
}
