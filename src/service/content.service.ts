import {
  CategoryEntity,
  ContentEntity,
  FileEntity,
  MemberEntity,
  SeriesEntity,
} from '@/entities';
import { ContentDto } from '@/model';
// import { CategoryService, SeriesService } from '@/service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryService, SeriesService } from '.';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(ContentEntity)
    private contentRepository: Repository<ContentEntity>,
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
    private readonly categoryService: CategoryService,
    private readonly seriesService: SeriesService,
  ) {}

  async checkNameExist(title: string) {
    const data = await this.contentRepository.findOne({
      where: { title: title },
    });

    return Boolean(data);
  }

  async getCountContentByMember(member: MemberEntity) {
    return await this.contentRepository.count({
      where: { created_by: { _id: member._id }, draft: false, complete: true },
    });
  }

  async upCountViewContent(content: ContentEntity) {
    content.count_view = content.count_view + 1;

    return this.contentRepository.save(content);
  }

  async topViewContent(payload: {
    _take: number | null;
    status: 'owner' | 'view';
    member?: MemberEntity;
  }) {
    const query = this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.category', 'category')
      .leftJoinAndSelect('content.image', 'image')
      .leftJoinAndSelect('content.created_by', 'created_by')
      .take(payload._take)
      .orderBy('content.count_view', 'DESC');

    if (payload.status === 'owner' && payload.member) {
      return await query
        .where('created_by._id = :member', { member: payload.member._id })
        .getMany();
    } else {
      return await query
        .where('content.complete = :isComplete AND content.draft = :isDraft', {
          isComplete: true,
          isDraft: false,
        })
        .getMany();
    }
  }

  async countContent() {
    return await this.contentRepository.count();
  }

  async contentsMoreComments(take: number | null, status: 'owner' | 'view') {
    if (status === 'owner') {
      return this.contentRepository
        .createQueryBuilder('content')
        .leftJoinAndSelect('content.comments', 'comments')
        .select(
          'content._id, content.title, COUNT(comments._id) as commentsCount',
        )
        .groupBy('content._id')
        .orderBy('commentsCount', 'DESC')
        .limit(take)
        .getRawMany();
    } else {
      return this.contentRepository
        .createQueryBuilder('content')
        .leftJoinAndSelect('content.comments', 'comments')
        .where('content.complete = :isComplete AND content.draft = :isDraft', {
          isComplete: true,
          isDraft: false,
        })
        .select(
          'content._id, content.title, COUNT(comments._id) as commentsCount',
        )
        .groupBy('content._id')
        .orderBy('commentsCount', 'DESC')
        .limit(take)
        .getRawMany();
    }
  }

  async getContentByMember(payload: {
    _take: number;
    _skip: number;
    _search: string;
    member: MemberEntity;
    status: 'view' | 'owner';
  }) {
    const query = this.contentRepository
      .createQueryBuilder('content')
      .skip(payload._skip)
      .take(payload._take)
      .leftJoinAndSelect('content.category', 'category')
      .leftJoinAndSelect('content.image', 'image')
      .leftJoinAndSelect('content.series', 'series')
      .where('LOWER(content.title) LIKE :search ', { search: payload._search });

    if (payload.status === 'owner') {
      return query.getManyAndCount();
    } else {
      return query
        .andWhere('draft = :draft AND complete = :complete', {
          draft: false,
          complete: true,
        })
        .getManyAndCount();
    }
  }

  async randomContents(take: number | null) {
    const contents = await this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.image', 'image')
      .where('content.complete = :isComplete AND content.draft = :isDraft', {
        isComplete: true,
        isDraft: false,
      })
      .orderBy('RANDOM()')
      .limit(take)
      .getRawMany();

    return contents;
  }

  async getContentById(id: string, status: 'view' | 'owner') {
    if (status === 'owner') {
      return await this.contentRepository.findOne({
        where: { _id: id },
        relations: {
          category: true,
          series: true,
          image: true,
          created_by: true,
        },
      });
    } else {
      return await this.contentRepository.findOne({
        where: { _id: id, draft: false, complete: true },
        relations: {
          category: true,
          series: true,
          image: true,
          created_by: true,
        },
      });
    }
  }

  async getContentByCategory(
    _take: number,
    _skip: number,
    _search: string,
    id: string,
    outside: string | undefined,
  ) {
    const query = this.contentRepository
      .createQueryBuilder('content')
      .skip(_skip)
      .take(_take)
      .leftJoinAndSelect('content.category', 'category')
      .leftJoinAndSelect('content.image', 'image')
      .leftJoinAndSelect('content.series', 'series')
      .where('LOWER(content.title) LIKE :search ', { search: _search })
      .andWhere(
        `category._id ${outside === 'true' ? '<>' : '='} :id ${
          outside === 'true' ? 'OR category._id  IS NULL' : ''
        } `,
        {
          id: id,
        },
      );

    const categories = await query
      .orderBy('content.created_at', 'DESC')
      .getMany();

    const max = await query.getCount();

    // console.log('categories : ', categories);

    const result = {
      data: categories,
      max: max,
    };

    return result;
  }

  async getContentBySeries(
    _take: number,
    _skip: number,
    _search: string,
    id: string,
    outside: string | undefined,
  ) {
    const query = this.contentRepository
      .createQueryBuilder('content')
      .skip(_skip)
      .take(_take)
      .leftJoinAndSelect('content.category', 'category')
      .leftJoinAndSelect('content.series', 'series')
      .where('LOWER(content.title) LIKE :search ', { search: _search })
      .andWhere(
        `series._id ${outside === 'true' ? '<>' : '='} :id ${
          outside === 'true' ? 'OR series._id IS NULL' : ''
        } `,
        {
          id: id,
        },
      );

    const series = await query.orderBy('content.created_at', 'DESC').getMany();

    const max = await query.getCount();

    const result = {
      data: series,
      max: max,
    };

    return result;
  }

  async getAllContent(payload: {
    _take: number;
    _skip: number;
    _search: string;
    _category: CategoryEntity | null;
    _series: SeriesEntity | null;
    _caseSort: string;
    // _status?: { isDraft: boolean; isComplete: boolean };
  }) {
    const query = this.contentRepository
      .createQueryBuilder('content')
      .skip(payload._skip)
      .take(payload._take)
      .leftJoinAndSelect('content.image', 'image')
      .leftJoinAndSelect('content.category', 'category')
      .leftJoinAndSelect('content.series', 'series')
      .leftJoinAndSelect('content.created_by', 'created_by')
      .where('LOWER(content.title) LIKE :search', { search: payload._search })
      .andWhere('content.complete = :isComplete AND content.draft = :isDraft', {
        isComplete: true,
        isDraft: false,
      });

    // const checkQuery = payload._status
    //   ? query.andWhere(
    //       'content.complete = :isComplete AND content.draft = :isDraft',
    //       {
    //         isComplete: payload._status.isComplete,
    //         isDraft: payload._status.isDraft,
    //       },
    //     )
    //   : query;

    const filterCategory = payload._category
      ? query.andWhere('category._id = :category ', {
          category: payload._category._id,
        })
      : query;

    const filterSeries = payload._series
      ? filterCategory.andWhere('series._id = :series ', {
          series: payload._series._id,
        })
      : filterCategory;

    const [value, order] = payload._caseSort.split('_');
    const contents = await filterSeries
      .orderBy(
        `content.${value === 'NAME' ? 'title' : 'created_at'}`,
        order === 'ASC' ? 'ASC' : 'DESC',
      )
      .getMany();

    const max = await query.getCount();

    const result = {
      data: contents,
      max: max,
    };

    return result;
  }

  async create(body: ContentDto, member: MemberEntity, filesData: FileEntity) {
    const _category =
      body.category &&
      Boolean(await this.categoryService.getCategoryById(body.category))
        ? await this.categoryService.getCategoryById(body.category)
        : undefined;

    const content = new ContentEntity();
    content.title = body.title;
    content.body = body.body;
    content.category = _category;
    content.tags = body.tags;
    content.complete = body.complete;
    content.draft = body.draft;
    content.created_by = member;
    content.image = filesData;

    return this.contentRepository.save(content);
  }

  async updateContent(_id: string, body: ContentDto, filesData?: FileEntity) {
    const content = await this.getContentById(_id, 'owner');
    if (!Boolean(content)) {
      throw new BadRequestException('Bài viết không tồn tại.');
    }

    const _category = body.category
      ? await this.categoryService.getCategoryById(body.category)
      : null;

    content.title = body.title;
    content.body = body.body;
    content.category = _category;
    content.complete = Boolean(body.complete);
    content.tags = body.tags;

    if (filesData) {
      content.image = filesData;
    }

    return this.contentRepository.save(content);
  }

  async changeCategory(content: ContentEntity, category: CategoryEntity) {
    if (content.category && content.category._id === category._id) {
      content.category = null;
      return await this.contentRepository.save(content);
    } else {
      content.category = category;
      return await this.contentRepository.save(content);
    }
  }

  async changeSeries(content: ContentEntity, series: SeriesEntity) {
    if (content.series && content.series._id === series._id) {
      content.series = null;
      return await this.contentRepository.save(content);
    } else {
      content.series = series;
      return await this.contentRepository.save(content);
    }
  }

  async delete(_id) {
    this.contentRepository.softDelete(_id);
  }
}
