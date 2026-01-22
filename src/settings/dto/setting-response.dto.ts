// setting-response.dto.ts
import { SettingType } from '@prisma/client';

export class SettingResponseDto {
  id: string;
  key: string;
  label: string;
  type: SettingType;
  valueString?: string;
  valueNumber?: number;
  valueBool?: boolean;
  options?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
