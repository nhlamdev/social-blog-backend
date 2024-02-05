import { IAccessJwtPayload } from '@/shared/types';
import { checkIsNumber } from '@/shared/utils/global-func';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { ILike } from 'typeorm';
import { SeriesService } from './series.service';
import { ContentService } from '../content/content.service';
import { SeriesDto } from './series.dto';
import { MaybeType } from '@/shared/utils/types/maybe.type';
import { MemberService } from '../member/member.service';

@Controller('series')
@ApiTags('series')
export class SeriesController {
  constructor(
    private readonly seriesService: SeriesService,
    private readonly memberService: MemberService,
    private readonly contentService: ContentService,
  ) {}

  @Get()
  async publicPaginate(
    @Query('skip') skip?: MaybeType<string>,
    @Query('take') take?: MaybeType<string>,
    @Query('search') search?: MaybeType<string>,
    @Query('author') author?: MaybeType<string>,
  ) {
    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;

    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    const [series, count] = await this.seriesService.repository.findAndCount({
      where: { title: ILike(_search), created_by: { _id: author } },
      take: _take,
      skip: _skip,
      order: { created_at: 'DESC' },
      relations: { created_by: true },
    });

    const seriesWithCountContent = await Promise.all(
      series.map(async (s) => {
        const count_contents = await this.contentService.repository.count({
          where: { series: { _id: s._id } },
        });
        return { ...s, count_contents };
      }),
    );

    return { series: seriesWithCountContent, count };
  }

  @Get('owner')
  @UseGuards(AuthGuard('jwt-access'))
  async owner(@Req() req) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const [series, count] = await this.seriesService.repository.findAndCount({
      where: { created_by: { _id: jwtPayload._id } },
      order: { created_at: 'DESC' },
      relations: { created_by: true },
    });

    const seriesWithCountContent = await Promise.all(
      series.map(async (series) => {
        const count = await this.contentService.repository.count({
          where: {
            series: { _id: series._id },
            public: true,
            complete: true,
          },
          relations: { series: true },
        });

        return { ...seriesWithCountContent, contentCount: count };
      }),
    );

    return { series: Promise.all(seriesWithCountContent), count };
  }

  @Get('owner/paginate')
  @UseGuards(AuthGuard('jwt-access'))
  async privatePaginate(
    @Req() req,
    @Query('skip') skip?: MaybeType<string>,
    @Query('take') take?: MaybeType<string>,
    @Query('search') search?: MaybeType<string>,
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

    const [series, count] = await this.seriesService.repository.findAndCount({
      where: { title: ILike(_search), created_by: { _id: jwtPayload._id } },
      take: _take,
      skip: _skip,
      order: { created_at: 'DESC' },
      relations: { created_by: true },
    });

    const seriesWithCountContent = series.map(async (series) => {
      const count = await this.contentService.repository.count({
        where: {
          series: { _id: series._id },
          public: true,
          complete: true,
        },
        relations: { series: true },
      });

      return { ...series, contentCount: count };
    });

    return { series: await Promise.all(seriesWithCountContent), count };
  }

  @Get('by-id/:id')
  async seriesById(@Param('id') id: string) {
    const series = await this.seriesService.repository.findOne({
      where: { _id: id },
      relations: { created_by: true },
    });

    if (!Boolean(series)) {
      throw new NotFoundException('Chuỗi bài viết không tồn tại!.');
    }

    return series;
  }

  @Get('more-avg-views-content')
  async seriesMoreAvgViewContent(@Query('take') take: MaybeType<string>) {
    const builder =
      await this.seriesService.repository.createQueryBuilder('series');

    const _take = checkIsNumber(take) ? Number(take) : null;

    return await builder
      .leftJoinAndSelect('series.contents', 'contents')
      .leftJoinAndSelect('series.created_by', 'created_by')
      .select(
        `series._id, series.title,created_by.name as created_name,created_by.image as created_image, created_by.email as created_email,
        COUNT(contents._id) as content_count, SUM(contents.count_view) as contents_total_views,
        ROUND(SUM(contents.count_view) / COUNT(contents._id)) as contents_avg_view`,
      )
      .where('contents.public = true AND contents.complete = true')
      .groupBy(
        'series._id, series.title,created_by.name,created_by.image,created_by.email',
      )
      .having('COUNT(contents._id) > 0')
      .andHaving('SUM(contents.count_view) > 0')
      .orderBy('contents_avg_view', 'DESC')
      .limit(_take)
      .getRawMany();
  }

  @Post()
  @UseGuards(AuthGuard('jwt-access'))
  async create(@Req() req, @Body() body: SeriesDto) {
    const jwtPayload: IAccessJwtPayload = req.user;

    if (!jwtPayload.role.owner && !jwtPayload.role.author) {
      throw new ForbiddenException('Bạn không có quyền hạn');
    }

    const member = await this.memberService.repository.findOne({
      where: { _id: jwtPayload._id },
    });

    return await this.seriesService.repository.save({
      title: body.title,
      description: body.description,
      created_by: member,
    });
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt-access'))
  async update(@Req() req, @Param('id') id: string, @Body() body: SeriesDto) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const series = await this.seriesService.repository.findOne({
      where: { _id: id },
    });

    if (
      jwtPayload.role.owner ||
      (jwtPayload.role.author && series.created_by._id === jwtPayload._id)
    ) {
      await this.seriesService.repository.update(id, body);
    } else {
      throw new ForbiddenException('Bạn không có quyền hạn');
    }
  }

  @Delete()
  @UseGuards(AuthGuard('jwt-access'))
  async delete(@Req() req, @Param('id') id: string) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const series = await this.seriesService.repository.findOne({
      where: { _id: id },
    });

    if (
      jwtPayload.role.owner ||
      (jwtPayload.role.author && series.created_by._id === jwtPayload._id)
    ) {
      await this.seriesService.repository.delete(id);
    } else {
      throw new ForbiddenException('Bạn không có quyền hạn');
    }
  }
}
