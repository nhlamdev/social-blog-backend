import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './file.entity';
import * as sharp from 'sharp';
import * as fs from 'fs';
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

  async optimize_image(f: any, size: number, key: string) {
    const folderPath = `./uploads/${key}`;

    const resizedImageBuffer = await sharp(f.path)
      .resize({ width: size, height: size, fit: 'inside' }) // Giữ nguyên tỷ lệ aspect ratio
      .toBuffer();

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    fs.writeFileSync(`${folderPath}/${f.filename}`, resizedImageBuffer);
  }

  async saveFile(files) {
    const filesCreate = Object.keys(files).map(async (key) => {
      const f = files[key];

      if (f.mimetype.startsWith('image')) {
        this.optimizeConfig.forEach(async (config) => {
          await this.optimize_image(f, config.size, config.key);
        });
      }

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
