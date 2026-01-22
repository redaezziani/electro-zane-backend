import { Injectable, BadRequestException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { secrets } from '../../config/secrets';

export interface LocalImageUploadOptions {
  folder?: string;
  fileName?: string;
}

export interface LocalImageUploadResult {
  url: string;
  filePath: string;
  fileName: string;
}

@Injectable()
export class LocalStorageService {
  private readonly publicDir = path.resolve(__dirname, '../../../public');

  async uploadImage(
    file: Express.Multer.File,
    options: LocalImageUploadOptions = {}
  ): Promise<LocalImageUploadResult> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images are allowed.');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 10MB.');
    }

    try {
      const folder = options.folder || 'products';
      const fileName = options.fileName || `${Date.now()}-${file.originalname}`;

      // Create directory if it doesn't exist
      const uploadDir = path.join(this.publicDir, 'images', folder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Save file
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, file.buffer);

      // Generate URL
      const url = `${secrets.BaseUrl}/images/${folder}/${fileName}`;

      return {
        url,
        filePath: `/images/${folder}/${fileName}`,
        fileName,
      };
    } catch (error) {
      console.error('Local storage upload error:', error);
      throw new BadRequestException('Failed to upload image');
    }
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    options: LocalImageUploadOptions = {}
  ): Promise<LocalImageUploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadPromises = files.map((file, index) => {
      const fileOptions = { ...options };
      if (options.fileName) {
        // Add index to filename if multiple files
        const ext = path.extname(file.originalname);
        const nameWithoutExt = options.fileName.replace(ext, '');
        fileOptions.fileName = `${nameWithoutExt}-${index}${ext}`;
      }
      return this.uploadImage(file, fileOptions);
    });

    return Promise.all(uploadPromises);
  }

  async deleteImage(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.publicDir, filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error('Local storage delete error:', error);
      throw new BadRequestException('Failed to delete image');
    }
  }

  async deleteMultipleImages(filePaths: string[]): Promise<void> {
    if (!filePaths || filePaths.length === 0) {
      return;
    }

    const deletePromises = filePaths.map(filePath => this.deleteImage(filePath));
    await Promise.all(deletePromises);
  }
}
