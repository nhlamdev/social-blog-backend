import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SeriesService } from '@/services';
import { checkIsNumber } from '@/utils/global-func';
import { ILike } from 'typeorm';

@Controller('series')
@ApiTags('content-series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Get()
  async all(
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

    return this.seriesService.findAll({
      where: { title: ILike(_search), created_by: author },
      take: _take,
      skip: _skip,
    });
  }

  @Get('/by-id/:id')
  async seriesById(@Param('id') id: string) {
    const series = await this.seriesService.findOne({ where: { _id: id } });

    if (!Boolean(series)) {
      throw new NotFoundException('Chuỗi bài viết không tồn tại!.');
    }

    return series;
  }
}
