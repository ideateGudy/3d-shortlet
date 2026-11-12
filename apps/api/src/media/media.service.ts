import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private useCloudinary: boolean;

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME') || process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY') || process.env.CLOUDINARY_API_KEY;
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET') || process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.useCloudinary = true;
      this.logger.log(`✓ Cloudinary activated for cloud: ${cloudName}`);
    } else {
      this.useCloudinary = false;
      this.logger.warn('Cloudinary credentials missing; falling back to local disk storage');
      // Ensure local uploads directory exists
      const uploadDir = path.resolve(__dirname, '..', '..', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<{ url: string; provider: 'cloudinary' | 'local' }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (this.useCloudinary) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: '3d-shortlet',
            resource_type: 'image',
          },
          (error, result) => {
            if (error || !result) {
              this.logger.error(`Cloudinary upload failed: ${error?.message}`);
              return reject(new BadRequestException(error?.message || 'Cloudinary upload failed'));
            }
            this.logger.log(`✓ File uploaded to Cloudinary: ${result.secure_url}`);
            resolve({ url: result.secure_url, provider: 'cloudinary' });
          }
        );
        uploadStream.end(file.buffer);
      });
    }

    // Local disk upload fallback
    const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, file.buffer);

    return {
      url: `/uploads/${filename}`,
      provider: 'local',
    };
  }
}
