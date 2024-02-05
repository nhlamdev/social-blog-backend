import { CASE_SORT } from '@/constants';
import { MailService } from '@/helper/mail/mail.service';
import { IAccessJwtPayload } from '@/shared/types';
import { checkIsNumber } from '@/shared/utils/global-func';
import { MaybeType } from '@/shared/utils/types/maybe.type';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { ILike, In, IsNull, Not } from 'typeorm';
import { CategoryService } from '../category/category.service';
import { CommentService } from '../comment/comment.service';
import { MemberService } from '../member/member.service';
import { NotificationService } from '../notification/notification.service';
import { SeriesService } from '../series/series.service';
import {
  ContentDto,
  ContentsByCategoryDto,
  SeriesByCategoryDto,
} from './content.dto';
import { ContentService } from './content.service';
@ApiTags('content')
@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly seriesService: SeriesService,
    private readonly categoryService: CategoryService,
    private readonly commentService: CommentService,
    private readonly memberRepository: MemberService,
    private readonly mailService: MailService,
    private readonly notificationService: NotificationService,
  ) {}

  @Get('public')
  async public(
    @Query('skip') skip: MaybeType<string>,
    @Query('take') take: MaybeType<string>,
    @Query('search') search: MaybeType<string>,
    @Query('category') category: MaybeType<string>,
    @Query('series') series: MaybeType<string>,
    @Query('sortCase') caseSort: MaybeType<string>,
    @Query('author') author: MaybeType<string>,
  ) {
    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;
    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    const [keyOder, typeOrder] = CASE_SORT.includes(caseSort)
      ? caseSort.split('_')
      : CASE_SORT[0].split('_');

    const order = {
      [keyOder === 'NAME' ? 'title' : 'created_at']:
        typeOrder === 'ASC' ? 'ASC' : 'DESC',
    };

    const [contents, count] = await this.contentService.repository.findAndCount(
      {
        where: {
          title: ILike(_search),
          category: { _id: category },
          series: { _id: series },
          created_by: { _id: author },
          public: true,
          complete: true,
        },
        skip: _skip,
        take: _take,
        relations: { created_by: true, series: true, category: true },
        order: order,
      },
    );

    const contentsWithCountContent = await Promise.all(
      contents.map(async (content) => {
        const count_comments = await this.commentService.repository.count({
          where: { content: { _id: content._id } },
          relations: { content: true },
        });
        return { ...content, count_comments };
      }),
    );

    return { contents: contentsWithCountContent, count };
  }

  @Get('bookmark')
  @UseGuards(AuthGuard('jwt-access'))
  async myBookmark(
    @Req() req,
    @Query('skip') skip: MaybeType<string>,
    @Query('take') take: MaybeType<string>,
    @Query('search') search: MaybeType<string>,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;
    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    const builder =
      await this.contentService.repository.createQueryBuilder('content');
    const contents = await builder
      .leftJoinAndSelect('content.category', 'category')
      .leftJoinAndSelect('content.series', 'series')
      .leftJoinAndSelect('content.created_by', 'created_by')
      .where('LOWER(content.title) LIKE :search ', {
        search: _search,
      })
      .andWhere('content.bookmark_by @> ARRAY[:...members]', {
        members: [jwtPayload._id],
      })
      .andWhere('content.public = true AND content.complete = true ')
      .take(_take)
      .skip(_skip)
      .getMany();

    const contentsWithCountComment = contents.map(async (content) => {
      const count_comments = await this.commentService.repository.count({
        where: { content: { _id: content._id } },
        relations: { content: true },
      });

      return { ...content, count_comments };
    });

    const count = await builder.getCount();

    return { contents: await Promise.all(contentsWithCountComment), count };
  }

  @Get('by-tag/:tag')
  async byTag(
    @Param('tag') tag: string,
    @Query('skip') skip: MaybeType<string>,
    @Query('take') take: MaybeType<string>,
    @Query('search') search: MaybeType<string>,
  ) {
    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;
    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    const builder =
      await this.contentService.repository.createQueryBuilder('content');
    const contents = await builder
      .leftJoinAndSelect('content.category', 'category')
      .leftJoinAndSelect('content.series', 'series')
      .leftJoinAndSelect('content.created_by', 'created_by')
      .where('LOWER(content.title) LIKE :search ', {
        search: _search,
      })
      .andWhere('content.tags @> ARRAY[:...members]', {
        members: [tag],
      })
      .andWhere('content.public = true AND content.complete = true ')
      .take(_take)
      .skip(_skip)
      .getMany();

    const count = await builder.getCount();

    return { contents, count };
  }

  @Get('private')
  @UseGuards(AuthGuard('jwt-access'))
  async private(
    @Req() req,
    @Query('skip') skip: MaybeType<string>,
    @Query('take') take: MaybeType<string>,
    @Query('search') search: MaybeType<string>,
    @Query('category') category: MaybeType<string>,
    @Query('series') series: MaybeType<string>,
    @Query('sortCase') caseSort: MaybeType<string>,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;
    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    const [keyOder, typeOrder] = CASE_SORT.includes(caseSort)
      ? caseSort
      : CASE_SORT[0];

    const [contents, count] = await this.contentService.repository.find({
      where: {
        title: ILike(_search),
        category: { _id: category },
        series: { _id: series },
        created_by: { _id: jwtPayload._id },
      },
      skip: _skip,
      take: _take,
      relations: { created_by: true, category: true, series: true },
      order: {
        [keyOder === 'NAME' ? 'title' : 'created_at']:
          typeOrder === 'ASC' ? 'ASC' : 'DESC',
      },
    });

    return { contents, count };
  }

  @Get('bookmark')
  @UseGuards(AuthGuard('jwt-access'))
  async bookmark(
    @Req() req,
    @Query('skip') skip: MaybeType<string>,
    @Query('take') take: MaybeType<string>,
    @Query('search') search: MaybeType<string>,
    @Query('sortCase') caseSort: MaybeType<string>,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;
    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    const [keyOder, typeOrder] = CASE_SORT.includes(caseSort)
      ? caseSort
      : CASE_SORT[0];

    return this.contentService.repository.find({
      where: {
        title: ILike(_search),
        created_by: { _id: jwtPayload._id },
        bookmark_by: In([jwtPayload._id]),
        public: true,
        complete: true,
      },
      relations: { created_by: true },
      skip: _skip,
      take: _take,
      order: {
        [`content.${keyOder === 'NAME' ? 'title' : 'created_at'}`]:
          typeOrder === 'ASC' ? 'ASC' : 'DESC',
      },
    });
  }

  @Get('by-category/:category')
  @UseGuards(AuthGuard('jwt-access'))
  async contentsByCategory(
    @Req() req,
    @Param('category') category: string,
    @Query() query: ContentsByCategoryDto,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const { outside, skip, take, search } = query;

    const [contents, count] = await this.contentService.repository.findAndCount(
      {
        where: {
          title: search ? ILike(search) : undefined,
          category: { _id: outside ? Not(category) : category },
          created_by: { _id: jwtPayload._id },
        },
        skip: skip,
        take: take,
        relations: { category: true },
      },
    );

    return { contents, count };
  }

  @Get('by-series/:series')
  @UseGuards(AuthGuard('jwt-access'))
  async contentsBySeries(
    @Req() req,
    @Param('series') series: string,
    @Query() query: SeriesByCategoryDto,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const { outside, search, skip, take } = query;

    const [contents, count] = await this.contentService.repository.findAndCount(
      {
        where: [
          {
            title: search ? ILike(search) : undefined,
            series: outside
              ? [{ _id: Not(series) }, { _id: IsNull() }]
              : { _id: series },
            created_by: { _id: jwtPayload._id },
          },
        ],
        skip: skip,
        take: take,
        relations: { series: true },
      },
    );

    return { contents, count };
  }

  @Get('tags-and-count')
  async tagsAndCount(
    @Query('author') author: MaybeType<string>,
    @Query('take') take: MaybeType<string>,
  ) {
    const _take = checkIsNumber(take) ? Number(take) : null;

    const tagsSelect = (
      await this.contentService.repository.find({
        select: { tags: true },
        where: { complete: true, public: true, created_by: { _id: author } },
      })
    )
      .map((tag) => tag.tags)
      .flat();

    const tagsCounts: { [key: string]: number } = {};

    for (const item of tagsSelect) {
      if (tagsCounts[item]) {
        tagsCounts[item]++;
      } else {
        tagsCounts[item] = 1;
      }
    }

    const tagsCountsWithSort = Object.keys(tagsCounts)
      .map((key) => ({
        tag: key,
        count: tagsCounts[key],
      }))
      .sort((a, b) => b.count - a.count);

    if (_take) {
      return tagsCountsWithSort.filter((_, index) => index < _take);
    } else {
      return tagsCountsWithSort;
    }
  }

  @Get('by-id/:id')
  async contentById(@Param('id') id: string) {
    const content = await this.contentService.repository.findOne({
      where: { _id: id, public: true, complete: true },
      relations: {
        created_by: true,
        series: true,
        category: true,
        comments: true,
      },
    });

    if (!Boolean(content)) {
      throw new BadRequestException('Bài viết không tồn tại.');
    }

    await this.contentService.repository.update(content._id, {
      count_view: content.count_view + 1,
    });

    return content;
  }

  @Get('private/by-id/:id')
  @UseGuards(AuthGuard('jwt-access'))
  async privateContentById(@Req() req, @Param('id') id: string) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const content = await this.contentService.repository.findOne({
      where: { _id: id },
      relations: {
        created_by: true,
        series: true,
        category: true,
        comments: true,
      },
    });

    if (!Boolean(content)) {
      throw new BadRequestException('Bài viết không tồn tại.');
    }

    if (jwtPayload._id !== content.created_by._id && !jwtPayload.role.owner) {
      throw new UnauthorizedException('Bạn không có quyền xem bài viết này.');
    }

    return content;
  }

  @Get('random')
  async randomContents(@Query('take') take: MaybeType<string>) {
    const _take = checkIsNumber(take) ? Number(take) : null;
    const builder =
      await this.contentService.repository.createQueryBuilder('content');

    const contents = builder
      .leftJoinAndSelect('content.category', 'category')
      .select(
        `content._id, content.title,content.count_view, content.created_at ,
        category.title as category`,
      )
      .where('content.public = true AND content.complete = true')
      .orderBy('RANDOM()')
      .limit(_take)
      .getRawMany();

    return contents;
  }

  @Get('more-views')
  async moreComment(@Query('take') take: MaybeType<string>) {
    const _take = checkIsNumber(take) ? Number(take) : undefined;

    const contents = await this.contentService.repository.find({
      take: _take,
      order: { count_view: 'DESC' },
      relations: {
        created_by: true,
        series: true,
        category: true,
      },
    });

    return contents;
  }

  @Get('more-comments')
  async moreViews(@Query('take') take: MaybeType<string>) {
    const _take = checkIsNumber(take) ? Number(take) : undefined;

    const builder =
      await this.contentService.repository.createQueryBuilder('content');

    const contents = await builder
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
      .limit(_take)
      .getRawMany();

    return contents;
  }

  @Post()
  @UseGuards(AuthGuard('jwt-access'))
  async create(@Req() req, @Body() body: ContentDto) {
    const jwtPayload: IAccessJwtPayload = req.user;

    if (!jwtPayload.role.author && !jwtPayload.role.owner) {
      throw new ForbiddenException('Bạn không có quyền hạn');
    }
    const category = await this.categoryService.repository.findOne({
      where: { _id: body.category },
    });

    if (!Boolean(category)) {
      throw new BadRequestException('Bạn chưa chọn thể loại.');
    }

    const member = await this.memberRepository.repository.findOne({
      where: { _id: jwtPayload._id },
    });

    const content = await this.contentService.repository.save({
      title: body.title,
      body: body.body,
      tags: body.tags,
      public: body.public,
      complete: body.complete,
      category,
      created_by: member,
    });

    if (body.public && body.complete) {
      const date = new Date();

      const timeFormat = `${date.getHours()}:${date.getHours()} ${date.getDate()}/${
        date.getMonth() + 1
      }/${date.getFullYear()}`;

      member.follow_by.forEach(async (m) => {
        const follower = await this.memberRepository.repository.findOne({
          where: { _id: m },
        });

        this.notificationService.repository.save({
          title: `vừa mới đăng tải bài viết ${body.title}`,
          from: jwtPayload._id,
          to: m,
          url: `/content/${content._id}`,
        });

        const subscribePayload = {
          title: `${member.name} vừa mới đăng tải bài viết.`,
          description: `Bài viết  ${body.title} vừa được đăng tải vào lúc ${timeFormat}`,
          emailReceive: follower.email,
          context: {
            author: member.name,
            create_time: timeFormat,
            content_title: body.title,
          },
        };

        this.mailService.sendNotifyMail(subscribePayload);
      });
    }

    return content;
  }

  @Patch(':id/vote-up')
  @UseGuards(AuthGuard('jwt-access'))
  async upVote(@Req() req, @Param('id') id: string) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const content = await this.contentService.repository.findOne({
      where: { _id: id, complete: true, public: true },
    });

    if (!Boolean(content)) {
      throw new BadRequestException('Bài viết không tồn tại');
    }

    const { member_down_vote, member_up_vote } = content;

    if (member_up_vote.includes(jwtPayload._id)) {
      await this.contentService.repository.update(content._id, {
        member_up_vote: member_up_vote.filter((v) => v !== jwtPayload._id),
        member_down_vote: member_down_vote.filter((v) => v !== jwtPayload._id),
      });
    } else {
      await this.contentService.repository.update(content._id, {
        member_up_vote: [...member_up_vote, jwtPayload._id],
        member_down_vote: member_down_vote.filter((v) => v !== jwtPayload._id),
      });
    }
  }

  @Patch(':id/vote-down')
  @UseGuards(AuthGuard('jwt-access'))
  async downVote(@Req() req, @Param('id') id: string) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const content = await this.contentService.repository.findOne({
      where: { _id: id, complete: true, public: true },
    });

    if (!Boolean(content)) {
      throw new BadRequestException('Bài viết không tồn tại');
    }

    const { member_down_vote, member_up_vote } = content;

    if (member_down_vote.includes(jwtPayload._id)) {
      await this.contentService.repository.update(content._id, {
        member_up_vote: member_up_vote.filter((v) => v !== jwtPayload._id),
        member_down_vote: member_down_vote.filter((v) => v !== jwtPayload._id),
      });
    } else {
      await this.contentService.repository.update(content._id, {
        member_up_vote: member_up_vote.filter((v) => v !== jwtPayload._id),
        member_down_vote: [...member_down_vote, jwtPayload._id],
      });
    }
  }

  @Patch(':id/bookmark')
  @UseGuards(AuthGuard('jwt-access'))
  async bookmarkAction(@Req() req, @Param('id') id: string) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const content = await this.contentService.repository.findOne({
      where: { _id: id, complete: true, public: true },
    });

    if (!Boolean(content)) {
      throw new BadRequestException('Bài viết không tồn tại');
    }

    const { bookmark_by } = content;

    if (bookmark_by.includes(jwtPayload._id)) {
      await this.contentService.repository.update(content._id, {
        bookmark_by: bookmark_by.filter((v) => v !== jwtPayload._id),
      });
    } else {
      await this.contentService.repository.update(content._id, {
        bookmark_by: [...bookmark_by, jwtPayload._id],
      });
    }
  }

  @Patch(':id/watch')
  @UseGuards(AuthGuard('jwt-access'))
  async watch(@Req() req, @Param('id') id: string) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const content = await this.contentService.repository.findOne({
      where: { _id: id },
    });

    if (content.watches.includes(jwtPayload._id)) {
      return '';
    }

    const watches = [...content.watches, jwtPayload._id];

    return await this.contentService.repository.update(id, { watches });
  }

  @Patch(':content/change-category/:category')
  @UseGuards(AuthGuard('jwt-access'))
  async changeCategory(
    @Req() req,
    @Param('content') content: string,
    @Param('category') category: string,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _content = await this.contentService.repository.findOne({
      where: { _id: content },
      relations: { created_by: true },
    });
    const _category = await this.categoryService.repository.findOne({
      where: { _id: category },
    });

    if (!_content) {
      throw new BadRequestException('Bài viết không tồn tại.');
    }

    if (!_category) {
      throw new BadRequestException('Thể loại không tồn tại.');
    }

    if (jwtPayload.role.owner || jwtPayload._id === _content.created_by._id) {
      await this.contentService.repository.update(_content._id, {
        category: _category,
      });
    } else {
      throw new ForbiddenException('Bạn không có quyền thao tác');
    }
  }

  @Patch(':content/change-series/:series')
  @UseGuards(AuthGuard('jwt-access'))
  async changeSeries(
    @Req() req,
    @Param('content') content: string,
    @Param('series') series: string,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _content = await this.contentService.repository.findOne({
      where: { _id: content },
      relations: { created_by: true, series: true },
    });
    const _series = await this.seriesService.repository.findOne({
      where: { _id: series },
    });

    if (!_content) {
      throw new BadRequestException('Bài viết không tồn tại.');
    }

    if (!_series) {
      throw new BadRequestException('Chuỗi bài viết không tồn tại.');
    }

    if (
      !(
        jwtPayload.role.owner ||
        (jwtPayload._id === _content.created_by._id &&
          jwtPayload._id === _series.created_by._id)
      )
    ) {
      throw new ForbiddenException('Bạn không có quyền thao tác');
    }

    if (_content?.series?._id === series) {
      await this.contentService.repository.update(_content._id, {
        series: null,
      });
    } else {
      await this.contentService.repository.update(_content._id, {
        series: _series,
      });
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt-access'))
  async update(@Req() req, @Param('id') id: string, @Body() body: ContentDto) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const content = await this.contentService.repository.findOne({
      where: { _id: id },
    });

    if (
      !(
        jwtPayload.role.owner ||
        (jwtPayload.role.author && content.created_by._id === jwtPayload._id)
      )
    ) {
      throw new ForbiddenException('Bạn không có quyền hạn');
    }

    await this.contentService.repository.update(id, {
      title: body.title,
      body: body.body,
      tags: body.tags,
    });

    if (typeof body.public === 'boolean') {
      await this.contentService.repository.update(id, {
        public: body.public,
      });
    }

    if (typeof body.complete === 'boolean') {
      await this.contentService.repository.update(id, {
        complete: body.complete,
      });
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt-access'))
  async delete(@Req() req, @Param('id') id: string) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const content = await this.contentService.repository.findOne({
      where: { _id: id },
    });

    if (
      jwtPayload.role.owner ||
      (jwtPayload.role.author && content.created_by._id === jwtPayload._id)
    ) {
      await this.contentService.repository.delete(id);
    } else {
      throw new ForbiddenException('Bạn không có quyền hạn');
    }
  }
}
