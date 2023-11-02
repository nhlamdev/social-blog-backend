import {
  CategoryEntity,
  CommentEntity,
  ContentEntity,
  MemberEntity,
  SeriesEntity,
} from '@/entities';
import { ContentDto } from '@/model';
// import { CategoryService, SeriesService } from '@/service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CategoryService, CommentService } from '.';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    @InjectRepository(ContentEntity)
    private contentRepository: Repository<ContentEntity>,
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    private categoryService: CategoryService,
    private commentService: CommentService,
  ) {}

  async checkExistByTitle(title: string) {
    return await this.contentRepository.exist({
      where: { title: title },
    });
  }

  async checkExistById(id: string) {
    return await this.contentRepository.exist({ where: { _id: id } });
  }

  async countContent() {
    return await this.contentRepository.count();
  }

  async oneContentById(id: string, status: 'view' | 'owner') {
    if (status === 'owner') {
      return await this.contentRepository.findOne({
        where: { _id: id },
        relations: {
          category: true,
          series: true,
          created_by: true,
        },
      });
    } else {
      return await this.contentRepository.findOne({
        where: { _id: id, complete: true, case_allow: Not('noly-me') },
        relations: {
          category: true,
          series: true,
          created_by: true,
        },
      });
    }
  }

  async countContentByMember(member: MemberEntity) {
    return await this.contentRepository.count({
      where: { created_by: { _id: member._id }, complete: true },
    });
  }

  async upCountViewContent(content: ContentEntity) {
    content.count_view = content.count_view + 1;

    return this.contentRepository.save(content);
  }

  async topViewContent(payload: {
    _take: number | null;
    member?: MemberEntity;
  }) {
    return await this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.category', 'category')
      .leftJoinAndSelect('content.created_by', 'created_by')
      .where('content.case_allow = :caseAlow ', { caseAlow: 'public' })
      .take(payload._take)
      .orderBy('content.count_view', 'DESC')
      .where('content.complete = :isComplete', {
        isComplete: true,
      })
      .getMany();
  }

  async contentsMoreComments(take: number | null) {
    return this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.comments', 'comments')
      .where('content.complete = :isComplete', {
        isComplete: true,
      })
      .select(
        'content._id, content.title, COUNT(comments._id) as commentsCount',
      )
      .where('content.case_allow = :caseAlow ', { caseAlow: 'public' })
      .groupBy('content._id')
      .orderBy('commentsCount', 'DESC')
      .limit(take)
      .getRawMany();
  }

  async manyContentByMember(payload: {
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
      .leftJoinAndSelect('content.series', 'series')
      .where('LOWER(content.title) LIKE :search ', { search: payload._search });

    if (payload.status === 'owner') {
      return query.getManyAndCount();
    } else {
      return query
        .where('content.case_allow = :caseAlow ', { caseAlow: 'public' })
        .andWhere('complete = :complete', {
          complete: true,
        })
        .getManyAndCount();
    }
  }

  async randomContents(take: number | null) {
    const contents = await this.contentRepository
      .createQueryBuilder('content')
      .where('content.complete = :isComplete', {
        isComplete: true,
      })
      .where('content.case_allow = :caseAlow ', { caseAlow: 'public' })
      .orderBy('RANDOM()')
      .limit(take)
      .getRawMany();

    return contents;
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
      .leftJoinAndSelect('content.series', 'series')
      .leftJoinAndSelect('content.created_by', 'created_by')
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

  async contentBySeries(
    _take: number,
    _skip: number,
    _search: string,
    id: string,
    outside: string | undefined,
    member: MemberEntity,
  ) {
    const query = this.contentRepository
      .createQueryBuilder('content')
      .skip(_skip)
      .take(_take)
      .leftJoinAndSelect('content.category', 'category')
      .leftJoinAndSelect('content.series', 'series')
      .leftJoinAndSelect('content.created_by', 'created_by')
      .where(
        'LOWER(content.title) LIKE :search AND created_by._id = :member ',
        {
          search: _search,
          member: member._id,
        },
      )
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

  async manyContent(payload: {
    _take: number;
    _skip: number;
    _search: string;
    _category: CategoryEntity | null;
    _series: SeriesEntity | null;
    _caseSort: string;
  }) {
    const query = this.contentRepository
      .createQueryBuilder('content')
      .skip(payload._skip)
      .take(payload._take)
      .leftJoinAndSelect('content.category', 'category')
      .leftJoinAndSelect('content.series', 'series')
      .leftJoinAndSelect('content.created_by', 'created_by')
      .where('content.case_allow = :caseAlow ', { caseAlow: 'public' })
      .where('LOWER(content.title) LIKE :search', { search: payload._search })
      .andWhere('content.complete = :isComplete', {
        isComplete: true,
      });

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
      data: await Promise.all(
        contents.map(async (content) => {
          const c = {
            ...content,
            count_comments:
              await this.commentService.countCommentByContent(content),
          };

          delete c.body;
          delete c.complete;
          delete c.delete_at;
          delete c.index;

          return c;
        }),
      ),
      max: max,
    };

    return result;
  }

  async create(body: ContentDto, member: MemberEntity) {
    const categoryExist = await this.categoryService.checkExistById(
      body.category,
    );

    const _category =
      body.category && categoryExist
        ? await this.categoryService.oneCategoryById(body.category)
        : undefined;

    const content = new ContentEntity();
    content.title = body.title;
    content.body = body.body;
    content.category = _category;
    content.tags = body.tags;
    content.complete = body.complete;
    content.created_by = member;

    return this.contentRepository.save(content);
  }

  async updateContent(_id: string, body: ContentDto) {
    const content = await this.oneContentById(_id, 'owner');
    if (!Boolean(content)) {
      throw new BadRequestException('Bài viết không tồn tại.');
    }

    const _category = body.category
      ? await this.categoryService.oneCategoryById(body.category)
      : null;

    content.title = body.title;
    content.body = body.body;
    content.category = _category;
    content.complete = Boolean(body.complete);
    content.tags = body.tags;

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

  async noteContent(
    content: ContentEntity,
    member: MemberEntity,
    status: 'add' | 'remove',
  ) {
    const isExist = await member.save_contents.includes(content);

    if (status === 'add') {
      if (isExist) {
        throw new BadRequestException('bài viết đã được lưu.');
      }

      member.save_contents.unshift(content);

      return await this.memberRepository.save(member);
    }

    if (status === 'remove') {
      if (isExist) {
        throw new BadRequestException('bài viết chưa được lưu.');
      }

      member.save_contents = await member.save_contents.filter(
        (v) => v._id === v._id,
      );

      return await this.memberRepository.save(member);
    }
  }

  async delete(_id) {
    this.contentRepository.softDelete(_id);
  }
}
