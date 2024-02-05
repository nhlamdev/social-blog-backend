import { OptimizeImageConfig } from '@/constants/common/image';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as sharp from 'sharp';
import { MemberEntity } from '../member/member.entity';
import { FileEntity } from './file.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as minio from 'minio';

@Injectable()
export class FileService {
  private readonly optimizeConfig = OptimizeImageConfig;

  private readonly minio = new minio.Client({
    endPoint: process.env.MINIO_ENDPOINT as string,
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY as string,
    secretKey: process.env.MINIO_SECRET_KEY as string,
  });

  constructor(
    @InjectRepository(FileEntity)
    public readonly repository: Repository<FileEntity>,
  ) {}

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
      })
      .webp()
      .toBuffer();

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    fs.writeFileSync(`${folderPath}/${options.fileName}`, resizedImageBuffer);
  }

  async saveFile(files, memberCreate: MemberEntity, isResize: boolean) {
    const filesCreate = Object.keys(files).map(async (key) => {
      const file = files[key];

      const newFile = new FileEntity();

      newFile.mimeType = file.mimetype;
      newFile.originalName = file.originalname;
      newFile.fileName = file.filename;
      newFile.size = file.size;
      newFile.created_by = memberCreate;

      if (file.mimetype.startsWith('image')) {
        const image = await sharp(file.path);
        const { width, height } = await image.metadata();
        const shape = { width, height };

        newFile.shape = shape;

        if (isResize) {
          const size_allowed = this.optimizeConfig.filter((v) => {
            return v.size < height || v.size < width;
          });

          newFile.size_allowed = [
            'original',
            ...size_allowed.map((v) => v.key as any),
          ];

          size_allowed.forEach(async (config) => {
            await this.optimize_image(image, {
              fileName: file.filename,
              size: config.size,
              key: config.key,
            });
          });
        }
      }

      return this.repository.save(newFile);
    });

    return Promise.all(filesCreate);
  }
}
