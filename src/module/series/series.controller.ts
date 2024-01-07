import { IAccessJwtPayload } from '@/shared/types';
import { checkIsNumber } from '@/shared/utils/global-func';
import {
  Controller,
  Delete,
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

@Controller('series')
@ApiTags('series')
export class SeriesController {
  constructor(
    private readonly seriesService: SeriesService,
    private readonly contentService: ContentService,
  ) {}

  @Get()
  async series(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
    @Query('author') author?: string,
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
      where: { title: ILike(_search), created_by: author },
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
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
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
      where: { title: ILike(_search), created_by: jwtPayload._id },
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
  async seriesMoreAvgViewContent() {}

  @Post()
  async create() {}

  @Put(':id')
  async update() {}

  @Delete()
  async delete() {}
}
