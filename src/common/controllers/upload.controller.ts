import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  UseGuards,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { LocalStorageService } from '../services/local-storage.service';
import { ImageUploadDto, ImageResponseDto } from '../dto/image.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly localStorageService: LocalStorageService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a single image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file and upload options',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file to upload',
        },
        folder: {
          type: 'string',
          description: 'Upload folder',
          example: 'products',
        },
        fileName: {
          type: 'string',
          description: 'Custom filename',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Image tags',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    type: ImageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or upload failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadOptions: ImageUploadDto,
  ): Promise<ImageResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.localStorageService.uploadImage(file, uploadOptions);

    return {
      url: result.url,
      thumbnailUrl: result.url,
      fileId: result.fileName,
      name: result.fileName,
      size: file.size,
      filePath: result.filePath,
    };
  }

  @Post('images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  @ApiOperation({ summary: 'Upload multiple images' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Multiple image files and upload options',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Image files to upload',
        },
        folder: {
          type: 'string',
          description: 'Upload folder',
          example: 'products',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Image tags',
        },
      },
      required: ['files'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Images uploaded successfully',
    type: [ImageResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid files or upload failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadOptions: ImageUploadDto,
  ): Promise<ImageResponseDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const results = await this.localStorageService.uploadMultipleImages(files, uploadOptions);

    return results.map((result, index) => ({
      url: result.url,
      thumbnailUrl: result.url,
      fileId: result.fileName,
      name: result.fileName,
      size: files[index].size,
      filePath: result.filePath,
    }));
  }

  @Delete('image/:fileId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an image' })
  @ApiParam({
    name: 'fileId',
    description: 'File ID for deletion',
    example: 'product-image.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'Image deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to delete image',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async deleteImage(@Param('fileId') fileId: string): Promise<{ message: string }> {
    // fileId is actually the fileName in local storage
    await this.localStorageService.deleteImage(fileId);
    return { message: 'Image deleted successfully' };
  }
}
