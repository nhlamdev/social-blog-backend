import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './file.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
  ) {}

  async saveFile(files) {
    const filesCreate = Object.keys(files).map((key) => {
      const f = files[key];

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
