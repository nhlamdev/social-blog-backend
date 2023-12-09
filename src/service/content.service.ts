import {
  CategoryEntity,
  CommentEntity,
  ContentEntity,
  MemberEntity,
  SeriesEntity,
} from '@/entities';
import { ContentDto } from '@/model';
// import { CategoryService, SeriesService } from '@/service';
import { AccessJwtPayload } from '@/interface';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Repository } from 'typeorm';
import { CategoryService, CommentService, CommonService } from '.';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    @InjectRepository(ContentEntity)
    private contentRepository: Repository<ContentEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    private readonly categoryService: CategoryService,
    private readonly commentService: CommentService,
    private readonly commonService: CommonService,
    @InjectQueue('QUEUE_MAIL') private queueMail: Queue,
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

  async oneContentById(id: string) {
    return (
      await this,
      this.contentRepository.findOne({
        where: { _id: id },
        relations: {
          category: true,
          series: true,
          created_by: true,
        },
      })
    );
    // if (status === 'owner') {
    //   return await this.contentRepository.findOne({
    //     where: { _id: id },
    //     relations: {
    //       category: true,
    //       series: true,
    //       created_by: true,
    //     },
    //   });
    // } else {
    //   return await this.contentRepository.findOne({
    //     where: { _id: id, complete: true, case_allow: Not('only-me') },
    //     relations: {
    //       category: true,
    //       series: true,
    //       created_by: true,
    //     },
    //   });
    // }
  }

  async manyAndCountContentMemberBookmark(
    jwtPayload: AccessJwtPayload,
    params: { _take: number; _skip: number; _search: string },
  ) {
    return this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.category', 'category')
      .leftJoinAndSelect('content.series', 'series')
      .leftJoinAndSelect('content.created_by', 'created_by')
      .select([
        'content._id',
        'content.title',
        'content.count_view',
        'content.tags',
        'content.created_at',
        'created_by._id',
        'created_by.name',
        'created_by.email',
        'created_by.image',
        'category._id ',
        'category.title ',
        'series._id ',
        'series.title ',
      ])
      .where('LOWER(content.title) LIKE :search ', {
        search: params._search,
      })
      .andWhere('content.bookmark_by @> ARRAY[:...members]', {
        members: [jwtPayload._id],
      })
      .andWhere('content.public = true AND content.complete = true ')
      .take(params._take)
      .skip(params._skip)
      .getManyAndCount();
  }

  async manyTagsPublicContentByAuthor(author?: string) {
    const query = await this.contentRepository
      .createQueryBuilder('content')
      .select('content.tags')
      .where('content.public = true AND content.complete = true ');

    const queryAuthorFilter = author
      ? query.andWhere('content.created_by = :author ', { author: author })
      : query;

    const queryResult = await queryAuthorFilter.getMany();

    return queryResult.reduce((result: { [key: string]: number }, curr) => {
      curr.tags.forEach((tag) => {
        if (result[tag]) {
          const newCount = result[tag] + 1;
          result[tag] = newCount;
        } else {
          result = { ...result, [tag]: 1 };
        }
      });
      return result;
    }, {});
  }

  async countContentByMember(memberId: string) {
    return await this.contentRepository.count({
      where: {
        created_by: { _id: memberId },
        complete: true,
        public: true,
      },
    });
  }

  async upCountViewContent(content: ContentEntity) {
    content.count_view = content.count_view + 1;

    return this.contentRepository.save(content);
  }

  async voteContentAction(
    jwtPayload: AccessJwtPayload,
    contentId: string,
    caseAction: 'up' | 'down',
  ) {
    const voteContentData = await this.contentRepository.findOne({
      where: { _id: contentId },
      select: { member_up_vote: true, member_down_vote: true },
    });

    const { member_down_vote, member_up_vote } = voteContentData;

    if (caseAction === 'up') {
      if (member_up_vote.includes(jwtPayload._id)) {
        await this.contentRepository.update(contentId, {
          member_up_vote: member_up_vote.filter((v) => v !== jwtPayload._id),
          member_down_vote: member_down_vote.filter(
            (v) => v !== jwtPayload._id,
          ),
        });
      } else {
        await this.contentRepository.update(contentId, {
          member_up_vote: [...member_up_vote, jwtPayload._id],
          member_down_vote: member_down_vote.filter(
            (v) => v !== jwtPayload._id,
          ),
        });
      }
    }

    if (caseAction === 'down') {
      if (member_down_vote.includes(jwtPayload._id)) {
        await this.contentRepository.update(contentId, {
          member_up_vote: member_up_vote.filter((v) => v !== jwtPayload._id),
          member_down_vote: member_down_vote.filter(
            (v) => v !== jwtPayload._id,
          ),
        });
      } else {
        await this.contentRepository.update(contentId, {
          member_up_vote: member_up_vote.filter((v) => v !== jwtPayload._id),
          member_down_vote: [...member_down_vote, jwtPayload._id],
        });
      }
    }

    // if(){}

    return voteContentData;
  }

  async topViewPublicContent(payload: { _take: number | null }) {
    return await this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.category', 'category')
      .leftJoinAndSelect('content.created_by', 'created_by')
      .select([
        'content._id',
        'content.title',
        'content.count_view',
        'content.tags',
        'content.created_at',
        'category._id ',
        'category.title ',
        'created_by._id',
        'created_by.name',
        'created_by.image',
        'created_by.email',
      ])
      .where('content.public = true')
      .take(payload._take)
      .orderBy('content.count_view', 'DESC')
      .where('content.complete = :isComplete', {
        isComplete: true,
      })
      .getMany();
  }

  async topViewAllContent(payload: { _take: number | null }) {
    return await this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.category', 'category')
      .leftJoinAndSelect('content.created_by', 'created_by')
      .take(payload._take)
      .orderBy('content.count_view', 'DESC')
      .getMany();
  }

  async manyContentMoreComments(take: number | null) {
    return this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.comments', 'comments')
      .leftJoinAndSelect('content.created_by', 'created_by')
      .where('content.complete = :isComplete', {
        isComplete: true,
      })
      .select(
        `content._id, 
        content.title,
        content.created_at,
        content.watches,
        created_by._id as created_by_id,
        created_by.name as created_by_name,
        created_by.email as created_by_email,
        created_by.image as created_by_image, 
        COUNT(comments._id) as comments_count`,
      )
      .where('content.public = true')
      .groupBy(
        `content._id, 
        content.title,
        created_by._id,
        created_by.name,
        created_by.email,
        created_by.image`,
      )
      .orderBy('comments_count', 'DESC')
      .having('COUNT(comments._id) > 0')
      .limit(take)
      .getRawMany();
  }

  async manyContentByMember(payload: {
    _take: number;
    _skip: number;
    _search: string;
    memberId: string;
    status: 'view' | 'owner';
  }) {
    const query = this.contentRepository
      .createQueryBuilder('content')
      .skip(payload._skip)
      .take(payload._take)
      .leftJoinAndSelect('content.category', 'category')
      .leftJoinAndSelect('content.series', 'series')
      .leftJoinAndSelect('content.created_by', 'created_by')
      .where('LOWER(content.title) LIKE :search ', { search: payload._search })
      .andWhere('created_by._id = :member ', { member: payload.memberId });

    if (payload.status === 'owner') {
      return query.getManyAndCount();
    } else {
      return query
        .andWhere('content.public = true  and content.complete = true')
        .getManyAndCount();
    }
  }

  async makeWatched(content: ContentEntity, jwtPayload: AccessJwtPayload) {
    if (content.watches.includes(jwtPayload._id)) {
      return;
    }
    content.watches = [...content.watches, jwtPayload._id];

    await this.contentRepository.save(content);
  }

  async randomContents(take: number | null) {
    const contents = await this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.category', 'category')
      .select(
        `content._id, content.title,content.count_view, content.created_at ,
        category.title as category`,
      )
      .where('content.public = true AND content.complete = true')
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
    member: AccessJwtPayload,
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

  async manyPublicContent(payload: {
    _take: number;
    _skip: number;
    _search: string;
    _category: CategoryEntity | null;
    _series: SeriesEntity | null;
    _caseSort: string;
    _author?: string;
  }) {
    const query = this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.category', 'category')
      .leftJoinAndSelect('content.series', 'series')
      .leftJoinAndSelect('content.created_by', 'created_by')
      .select([
        'content._id',
        'content.title',
        'content.count_view',
        'content.tags',
        'content.created_at',
        'content.bookmark_by',
        'content.member_up_vote',
        'content.member_down_vote',
        'category._id',
        'category.title',
        'created_by._id',
        'created_by.name',
        'created_by.image',
        'created_by.email',
      ])
      .skip(payload._skip)
      .take(payload._take)
      .andWhere('LOWER(content.title) LIKE :search', {
        search: payload._search,
      })
      .where('content.public = true AND content.complete = true');

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

    const filterAuthor = payload._author
      ? filterSeries.andWhere('created_by._id = :author ', {
          author: payload._author,
        })
      : filterSeries;

    const [value, order] = payload._caseSort.split('_');

    const contents = await filterAuthor
      .orderBy(
        `content.${value === 'NAME' ? 'title' : 'created_at'}`,
        order === 'ASC' ? 'ASC' : 'DESC',
      )
      .getMany();

    const max = await filterAuthor.getCount();

    const result = {
      data: await Promise.all(
        contents.map(async (content) => {
          const c = {
            ...content,
            count_comments:
              await this.commentService.countCommentByContent(content),
          };

          return c;
        }),
      ),
      max: max,
    };

    return result;
  }

  async create(body: ContentDto, memberId: string) {
    const member = await this.memberRepository.findOne({
      where: { _id: memberId },
    });

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
    content.public = body.public;
    content.complete = body.complete;
    content.created_by = member;

    if (body.public) {
      member.follow_by.forEach((m) => {
        const notifyPayload: {
          title: string;
          description?: string;
          from: string;
          to: string;
          url?: string;
        } = {
          from: member._id,
          to: m,
          title: 'đăng tải bài viết',
          url: `/content/${content._id}`,
        };

        this.commonService.saveNotify(notifyPayload);
      });
    }

    return this.contentRepository.save(content);
  }

  async updateContent(_id: string, body: ContentDto, content: ContentEntity) {
    const _category = body.category
      ? await this.categoryService.oneCategoryById(body.category)
      : null;

    content.title = body.title;
    content.body = body.body;
    content.category = _category;
    content.public = body.public;
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

  async bookMarkContent(content: ContentEntity, jwtPayload: AccessJwtPayload) {
    const isExist = await content.bookmark_by.includes(jwtPayload._id);

    if (isExist) {
      content.bookmark_by = content.bookmark_by.filter(
        (v) => v !== jwtPayload._id,
      );
    } else {
      content.bookmark_by.push(jwtPayload._id);

      return await this.contentRepository.save(content);
    }

    return await this.contentRepository.save(content);
  }

  async delete(_id) {
    this.contentRepository.softDelete(_id);
  }
}
