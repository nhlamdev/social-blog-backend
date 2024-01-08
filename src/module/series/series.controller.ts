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

@Controller('series')
@ApiTags('series')
export class SeriesController {
  constructor(
    private readonly seriesService: SeriesService,
    private readonly contentService: ContentService,
  ) {}

  @Get()
  async series(
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

    const [series, count] = await this.seriesService.findAllAndCount({
      where: { title: ILike(_search), created_by: { _id: author } },
      take: _take,
      skip: _skip,
      order: { created_at: 'DESC' },
    });

    return { series, count };
  }

  @Get('owner')
  @UseGuards(AuthGuard('jwt-access'))
  async seriesByOwner(
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

    const [series, count] = await this.seriesService.findAllAndCount({
      where: { title: ILike(_search), created_by: { _id: jwtPayload._id } },
      take: _take,
      skip: _skip,
      order: { created_at: 'DESC' },
    });

    return { series, count };
  }

  @Get('by-id/:id')
  async seriesById(@Param('id') id: string) {
    const series = await this.seriesService.findOne({ where: { _id: id } });

    if (!Boolean(series)) {
      throw new NotFoundException('Chuỗi bài viết không tồn tại!.');
    }

    return series;
  }

  @Get('more-avg-views-content')
  async seriesMoreAvgViewContent(@Query('take') take: MaybeType<string>) {
    const builder = await this.seriesService.builder();

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

    return await this.seriesService.create(body);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt-access'))
  async update(@Req() req, @Param('id') id: string, @Body() body: SeriesDto) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const series = await this.seriesService.findOne({ where: { _id: id } });

    if (
      jwtPayload.role.owner ||
      (jwtPayload.role.author && series.created_by._id === jwtPayload._id)
    ) {
      await this.seriesService.update(id, body);
    } else {
      throw new ForbiddenException('Bạn không có quyền hạn');
    }
  }

  @Delete()
  @UseGuards(AuthGuard('jwt-access'))
  async delete(@Req() req, @Param('id') id: string) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const series = await this.seriesService.findOne({ where: { _id: id } });

    if (
      jwtPayload.role.owner ||
      (jwtPayload.role.author && series.created_by._id === jwtPayload._id)
    ) {
      await this.seriesService.delete(id);
    } else {
      throw new ForbiddenException('Bạn không có quyền hạn');
    }
  }
}
