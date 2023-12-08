import { FileEntity, NotifyEntity, SessionEntity } from '@/entities';
import { owner_visualize } from '@/interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import * as cacheKeys from '@/constants/cache-key';
import { AuthService, CategoryService, ContentService, SeriesService } from '.';
@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
    @InjectRepository(SessionEntity)
    private sessionRepository: Repository<SessionEntity>,
    @InjectRepository(NotifyEntity)
    private notifyRepository: Repository<NotifyEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly contentService: ContentService,
    private readonly seriesService: SeriesService,
    private readonly categoryService: CategoryService,
    private readonly authService: AuthService,
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

    const count_member_online = await this.cacheManager.get(
      cacheKeys.TOTAL_MEMBER_ONLINE,
    );

    const result: owner_visualize = {
      total_member_access: sessions,
      total_member_online:
        typeof count_member_online === 'number' ? count_member_online : 0,
      total_memory_use:
        Math.round(
          filesSize.reduce((old: number, current: any) => {
            return old + current.file_size;
          }, 0) /
            ((1024 * 1024) / 100),
        ) / 100,
    };

    return result;
  }

  async status() {
    const count = {
      content: await this.contentService.countContent(),
      series: await this.seriesService.countSeries(),
      category: await this.categoryService.countCategory(),
    };

    return count;
  }

  async allNotify() {
    const notifies = await this.notifyRepository.find();

    return notifies;
  }
}
