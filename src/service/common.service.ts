import { FileEntity } from '@/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
  ) {}

  async saveFile(files: Express.Multer.File) {
    for (let index = 0; index < Object.keys(files).length; index++) {
      const element = files[index];
    }
  }
}
