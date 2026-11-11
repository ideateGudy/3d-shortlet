import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MediaService {
  private useCloudinary: boolean;

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.useCloudinary = true;
    } else {
      this.useCloudinary = false;
      // Ensure local uploads directory exists
      const uploadDir = path.resolve(__dirname, '..', '..', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<{ url: string }> {
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
              return reject(new BadRequestException(error?.message || 'Cloudinary upload failed'));
            }
            resolve({ url: result.secure_url });
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
    };
  }
}
