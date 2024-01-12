import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as sharp from 'sharp';
import * as fs from 'fs';
import { OptimizeImageConfig } from '@/constants/common/image';
import { FileEntity } from './file.entity';

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

  async optimize_image(
    image: sharp.Sharp,
    options: { size: number; key: string; fileName: string },
  ) {
    const folderPath = `./uploads/${options.key}`;

    const resizedImageBuffer = await image
      .resize({
        width: options.size,
        height: options.size,
        fit: sharp.fit.inside,
      }) // Giữ nguyên tỷ lệ aspect ratio
      .toBuffer();

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    fs.writeFileSync(`${folderPath}/${options.fileName}`, resizedImageBuffer);
  }

  async saveFile(files) {
    const filesCreate = Object.keys(files).map(async (key) => {
      const file = files[key];

      const image = await sharp(file.path);
      const { width, height } = await image.metadata();

      const newFile = new FileEntity();

      const shape = { width, height };

      newFile.mimeType = file.mimetype;
      newFile.originalName = file.originalname;
      newFile.fileName = file.filename;
      newFile.size = file.size;

      if (file.mimetype.startsWith('image')) {
        newFile.shape = shape;

        this.optimizeConfig
          .filter((v) => {
            return v.size < height || v.size < width;
          })
          .forEach(async (config) => {
            await this.optimize_image(image, {
              fileName: file.filename,
              size: config.size,
              key: config.key,
            });
          });
      }

      return this.fileRepository.save(newFile);
    });
    return Promise.all(filesCreate);
  }
}
