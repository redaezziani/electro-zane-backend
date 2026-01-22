import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SettingResponseDto } from './dto/setting-response.dto';
import { SettingType } from '@prisma/client';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSettingDto): Promise<SettingResponseDto> {
    const setting = await this.prisma.setting.create({
      data: { ...dto },
    });
    return this.format(setting);
  }

  async findAll(): Promise<SettingResponseDto[]> {
    const settings = await this.prisma.setting.findMany();
    return settings.map(this.format);
  }

  async findOne(key: string): Promise<SettingResponseDto> {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    if (!setting) throw new NotFoundException(`Setting "${key}" not found`);
    return this.format(setting);
  }

  async update(
    key: string,
    dto: UpdateSettingDto,
  ): Promise<SettingResponseDto> {
    const existing = await this.prisma.setting.findUnique({ where: { key } });
    if (!existing) throw new NotFoundException(`Setting "${key}" not found`);

    const updated = await this.prisma.setting.update({
      where: { key },
      data: { ...dto },
    });
    return this.format(updated);
  }

  async remove(key: string): Promise<void> {
    const existing = await this.prisma.setting.findUnique({ where: { key } });
    if (!existing) throw new NotFoundException(`Setting "${key}" not found`);
    await this.prisma.setting.delete({ where: { key } });
  }

  private format(setting: any): SettingResponseDto {
    return {
      id: setting.id,
      key: setting.key,
      label: setting.label,
      type: setting.type,
      valueString: setting.valueString,
      valueNumber: setting.valueNumber,
      valueBool: setting.valueBool,
      options: setting.options,
      description: setting.description,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
    };
  }
}
