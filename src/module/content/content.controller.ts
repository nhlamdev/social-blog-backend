import { CASE_SORT } from '@/constants';
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
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ILike, In } from 'typeorm';
import { CategoryService } from '../category/category.service';
import { SeriesService } from '../series/series.service';
import { ContentService } from './content.service';
import { ContentDto } from './content.dto';
import { IAccessJwtPayload } from '@/shared/types';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('content')
@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly seriesService: SeriesService,
    private readonly categoryService: CategoryService,
  ) {}

  @Get('public')
  async public(
    @Query('skip') skip: MaybeType<string>,
    @Query('take') take: MaybeType<string>,
    @Query('search') search: MaybeType<string>,
    @Query('category') category: MaybeType<string>,
    @Query('series') series: MaybeType<string>,
    @Query('tag') tag: MaybeType<string>,
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
      ? caseSort
      : CASE_SORT[0];

    return this.contentService.findAll({
      where: {
        title: ILike(_search),
        category: { _id: category },
        series: { _id: series },
        tags: tag ? In([tag]) : undefined,
        created_by: { _id: author },
        public: true,
        complete: true,
      },
      skip: _skip,
      take: _take,
      relations: { created_by: true },
      order: {
        [`content.${keyOder === 'NAME' ? 'title' : 'created_at'}`]:
          typeOrder === 'ASC' ? 'ASC' : 'DESC',
      },
    });
  }

  @Get('private')
  @UseGuards(AuthGuard('jwt-access'))
  async all(
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

    return this.contentService.findAll({
      where: {
        title: ILike(_search),
        category: { _id: category },
        series: { _id: series },
        created_by: { _id: jwtPayload._id },
        public: true,
        complete: true,
      },
      skip: _skip,
      take: _take,
      relations: { created_by: true },
      order: {
        [`content.${keyOder === 'NAME' ? 'title' : 'created_at'}`]:
          typeOrder === 'ASC' ? 'ASC' : 'DESC',
      },
    });
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

    return this.contentService.findAll({
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

  @Get('tags-and-count')
  async tagsAndCount(
    @Query('author') author: MaybeType<string>,
    @Query('take') take: MaybeType<string>,
  ) {
    const _take = checkIsNumber(take) ? Number(take) : null;

    const tagsSelect = (
      await this.contentService.findAll({
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
    const content = await this.contentService.findOne({
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

    return content;
  }

  @Get('private/by-id/:id')
  async privateContentById(@Param('id') id: string) {
    const content = await this.contentService.findOne({
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

    return content;
  }

  @Get('random')
  @ApiTags('content')
  async randomContents(@Query('take') take: MaybeType<string>) {
    const _take = checkIsNumber(take) ? Number(take) : null;

    const builder = await this.categoryService.builder();

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

    const contents = await this.contentService.findAll({
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

    const builder = await this.contentService.builder();

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
    const category = await this.categoryService.findOne({
      where: { _id: body.category },
    });

    if (!Boolean(category)) {
      throw new BadRequestException('Bạn chưa chọn thể loại.');
    }

    await this.contentService.create(body, category);
  }

  @Patch('/:id/vote-up')
  @UseGuards(AuthGuard('jwt-access'))
  async upVote(@Req() req, @Param('id') id: string) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const content = await this.contentService.findOne({
      where: { _id: id, complete: true, public: true },
    });

    if (!Boolean(content)) {
      throw new BadRequestException('Bài viết không tồn tại');
    }

    const { member_down_vote, member_up_vote } = content;

    if (member_up_vote.includes(jwtPayload._id)) {
      await this.contentService.update(content._id, {
        member_up_vote: member_up_vote.filter((v) => v !== jwtPayload._id),
        member_down_vote: member_down_vote.filter((v) => v !== jwtPayload._id),
      });
    } else {
      await this.contentService.update(content._id, {
        member_up_vote: [...member_up_vote, jwtPayload._id],
        member_down_vote: member_down_vote.filter((v) => v !== jwtPayload._id),
      });
    }
  }

  @Patch(':id/vote-down')
  @UseGuards(AuthGuard('jwt-access'))
  async downVote(@Req() req, @Param('id') id: string) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const content = await this.contentService.findOne({
      where: { _id: id, complete: true, public: true },
    });

    if (!Boolean(content)) {
      throw new BadRequestException('Bài viết không tồn tại');
    }

    const { member_down_vote, member_up_vote } = content;

    if (member_down_vote.includes(jwtPayload._id)) {
      await this.contentService.update(content._id, {
        member_up_vote: member_up_vote.filter((v) => v !== jwtPayload._id),
        member_down_vote: member_down_vote.filter((v) => v !== jwtPayload._id),
      });
    } else {
      await this.contentService.update(content._id, {
        member_up_vote: member_up_vote.filter((v) => v !== jwtPayload._id),
        member_down_vote: [...member_down_vote, jwtPayload._id],
      });
    }
  }

  @Patch(':id/bookmark')
  @UseGuards(AuthGuard('jwt-access'))
  async bookmarkAction(@Req() req, @Param('id') id: string) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const content = await this.contentService.findOne({
      where: { _id: id, complete: true, public: true },
    });

    if (!Boolean(content)) {
      throw new BadRequestException('Bài viết không tồn tại');
    }

    const { bookmark_by } = content;

    if (bookmark_by.includes(jwtPayload._id)) {
      await this.contentService.update(content._id, {
        bookmark_by: bookmark_by.filter((v) => v === jwtPayload._id),
      });
    } else {
      await this.contentService.update(content._id, {
        bookmark_by: [...bookmark_by, jwtPayload._id],
      });
    }
  }

  @Patch(':content/change-category/:category')
  @UseGuards(AuthGuard('jwt-access'))
  async changeCategory(
    @Req() req,
    @Param('content') content: string,
    @Param('category') category: string,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _content = await this.contentService.findOne({
      where: { _id: content },
      relations: { created_by: true },
    });
    const _category = await this.categoryService.findOne({
      where: { _id: category },
    });

    if (!_content) {
      throw new BadRequestException('Bài viết không tồn tại.');
    }

    if (!_category) {
      throw new BadRequestException('Thể loại không tồn tại.');
    }

    if (jwtPayload.role.owner || jwtPayload._id === _content.created_by._id) {
      await this.contentService.update(_content._id, { category: _category });
    } else {
      throw new ForbiddenException('Bạn không có quyền thao tác');
    }
  }

  @Patch(':content/change-series/:category')
  @UseGuards(AuthGuard('jwt-access'))
  async changeSeries(
    @Req() req,
    @Param('content') content: string,
    @Param('series') series: string,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _content = await this.contentService.findOne({
      where: { _id: content },
      relations: { created_by: true },
    });
    const _series = await this.seriesService.findOne({
      where: { _id: series },
    });

    if (!_content) {
      throw new BadRequestException('Bài viết không tồn tại.');
    }

    if (!_series) {
      throw new BadRequestException('Chuỗi bài viết không tồn tại.');
    }

    if (
      jwtPayload.role.owner ||
      (jwtPayload._id === _content.created_by._id &&
        jwtPayload._id === _series.created_by._id)
    ) {
      await this.contentService.update(_content._id, { series: _series });
    } else {
      throw new ForbiddenException('Bạn không có quyền thao tác');
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt-access'))
  async update(@Req() req, @Param('id') id: string, @Body() body: ContentDto) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const content = await this.contentService.findOne({ where: { _id: id } });

    if (
      !(
        jwtPayload.role.owner ||
        (jwtPayload.role.author && content.created_by._id === jwtPayload._id)
      )
    ) {
      throw new ForbiddenException('Bạn không có quyền hạn');
    }

    await this.contentService.update(id, {
      title: body.title,
      body: body.body,
      tags: body.tags,
    });

    if (typeof body.public === 'boolean') {
      await this.contentService.update(id, {
        public: body.public,
      });
    }

    if (typeof body.complete === 'boolean') {
      await this.contentService.update(id, {
        complete: body.complete,
      });
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt-access'))
  async delete(@Req() req, @Param('id') id: string) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const content = await this.contentService.findOne({ where: { _id: id } });

    if (
      jwtPayload.role.owner ||
      (jwtPayload.role.author && content.created_by._id === jwtPayload._id)
    ) {
      await this.contentService.delete(id);
    } else {
      throw new ForbiddenException('Bạn không có quyền hạn');
    }
  }
}
