import { FileEntity, SessionEntity } from '@/entities';
import { owner_visualize } from '@/interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
    @InjectRepository(SessionEntity)
    private sessionRepository: Repository<SessionEntity>,
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

    // return [];
    return Promise.all(filesCreate);
  }

  async checkMemoryUse() {
    const filesSize = await this.fileRepository
      .createQueryBuilder('file')
      .select('file.size')
      .getMany();

    return {
      totalFilesSize: filesSize.reduce(
        (previousValue: number, currentValue: FileEntity) =>
          previousValue + currentValue.size,
        0,
      ),
    };
  }

  async ownerVisualizeData(): Promise<owner_visualize> {
    const filesSize = await this.fileRepository
      .createQueryBuilder('file')
      .select('file.size')
      .getRawMany();

    const sessions = await this.sessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.member', 'member')
      .groupBy('member._id')
      .getCount();

    const result: owner_visualize = {
      total_content: 0,
      total_member_access: sessions,
      total_member_online: 0,
      total_memory_use: Math.round(
        filesSize.reduce((old: number, current: any) => {
          return old + current.file_size;
        }, 0) /
          (1024 * 1024),
      ),
    };

    return result;
  }
}
