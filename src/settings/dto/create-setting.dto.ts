// create-setting.dto.ts
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { SettingType } from '@prisma/client';

export class CreateSettingDto {
  @IsString()
  key: string;

  @IsString()
  label: string;

  @IsEnum(SettingType)
  type: SettingType;

  @IsOptional()
  @IsString()
  valueString?: string;

  @IsOptional()
  @IsNumber()
  valueNumber?: number;

  @IsOptional()
  @IsBoolean()
  valueBool?: boolean;

  @IsOptional()
  @IsString()
  options?: string; // comma-separated or JSON

  @IsOptional()
  @IsString()
  description?: string;
}
