import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './file.entity';
import sharp from 'sharp';
import fs from 'fs';
import { OptimizeImageConfig } from '@/constants/common/image';

@Injectable()
export class FileService {
  private optimizeConfig = OptimizeImageConfig;

  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}

  async findAll() {
    await this.fileRepository.find();
  }

  async optimize_image(f) {
    if (!f.mimetype.startsWith('image')) {
      const resizedImageBuffer = await sharp(f.path)
        .resize({ width: 800, height: 600, fit: 'inside' }) // Giữ nguyên tỷ lệ aspect ratio
        .toBuffer();

      fs.writeFileSync(`./uploads/${resizedFileName}`, resizedImageBuffer);
    }
  }

  async saveFile(files) {
    const filesCreate = Object.keys(files).map(async (key) => {
      const f = files[key];

      await this.optimize_image(f);

      const newFile = new FileEntity();
      newFile.mimeType = f.mimetype;
      newFile.originalName = f.originalname;
      newFile.fileName = f.filename;
      newFile.size = f.size;

      return this.fileRepository.save(newFile);
    });
    return Promise.all(filesCreate);
  }
}
