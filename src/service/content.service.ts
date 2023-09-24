import {
  CategoryEntity,
  ContentEntity,
  FileEntity,
  SeriesEntity,
} from '@/entities';
import { ContentDto } from '@/model';
// import { CategoryService, SeriesService } from '@/service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeriesService, CategoryService } from '.';

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
  async upCountViewContent(content: ContentEntity) {
    content.count_view = content.count_view + 1;

    return this.contentRepository.save(content);
  }

  async topViewContent(take: number | null) {
    return await this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.category', 'category')
      .leftJoinAndSelect('content.image', 'image')
      .take(take)
      .orderBy('content.count_view', 'DESC')
      .getMany();
  }

  async countContent() {
    return await this.contentRepository.count();
  }

  async randomContents(take: number | null) {
    return await this.contentRepository
      .createQueryBuilder('content')
      .orderBy('RANDOM()')
      .take(take)
      .getMany();
  }

  async getContentById(id: string) {
    return await this.contentRepository.findOne({
      where: { _id: id },
      relations: { category: true, series: true, image: true },
    });
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
      .leftJoinAndSelect('content.image', 'image')
      .leftJoinAndSelect('content.category', 'category')
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
      .leftJoinAndSelect('content.image', 'image')
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

  async getAllContent(
    _take: number,
    _skip: number,
    _search: string,
    _category: CategoryEntity | null,
    _series: SeriesEntity | null,
    _caseSort: string,
    _status: boolean,
  ) {
    const query = this.contentRepository
      .createQueryBuilder('content')
      .skip(_skip)
      .take(_take)
      .leftJoinAndSelect('content.image', 'image')
      .leftJoinAndSelect('content.category', 'category')
      .leftJoinAndSelect('content.series', 'series')
      .where('LOWER(content.title) LIKE :search', { search: _search });

    const checkQuery = _status
      ? query.andWhere('content.complete = :status', { status: _status })
      : query;

    const filterCategory = _category
      ? checkQuery.andWhere('category._id = :category ', {
          category: _category._id,
        })
      : checkQuery;

    const filterSeries = _series
      ? filterCategory.andWhere('series._id = :series ', {
          series: _series._id,
        })
      : filterCategory;

    const [value, order] = _caseSort.split('_');
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

  async create(body: ContentDto, files?: FileEntity[]) {
    const _category =
      body.category &&
      Boolean(await this.categoryService.getCategoryById(body.category))
        ? await this.categoryService.getCategoryById(body.category)
        : undefined;
    // const tags = await this.tagSerivce.createManyTag(body.tags);
    const content = new ContentEntity();
    content.title = body.title;
    content.body = body.body;
    content.category = _category;
    content.tags = body.tags;
    content.complete = body.complete;
    content.draft = body.draft;

    if (files.length !== 0) {
      content.image = files[0];
    }

    return this.contentRepository.save(content);
  }

  async updateContent(
    _id: string,
    payload: {
      title: string;
      body: string;
      category?: string;
      tags?: string[];
      complete?: boolean;
    },
    files?: FileEntity[],
  ) {
    const content = await this.getContentById(_id);
    if (!Boolean(content)) {
      throw new BadRequestException('Bài viết không tồn tại.');
    }

    const _category = payload.category
      ? await this.categoryService.getCategoryById(payload.category)
      : null;

    content.title = payload.title;
    content.body = payload.body;
    content.category = _category;
    content.complete = Boolean(payload.complete);
    content.tags = payload.tags;
    if (files && files.length !== 0) {
      content.image = files[0];
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
