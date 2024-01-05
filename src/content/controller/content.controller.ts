import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContentService } from '../service';
import { MaybeType } from '@/utils/types/maybe.type';
import { CASE_SORT } from '@/constants';
import { checkIsNumber } from '@/utils/global-func';
import { ILike, In } from 'typeorm';

@ApiTags('content')
@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly seriesService: ContentService,
    private readonly categoryService: ContentService,
  ) {}

  @Get('public')
  async all(
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
      ? caseSort
      : CASE_SORT[0];

    return this.seriesService.findAll({
      where: {
        title: ILike(_search),
        category: { _id: category },
        series: { _id: series },
        created_by: author,
        bookmark_by: In([author]),
      },
      skip: _skip,
      take: _take,
      order: {
        [`content.${keyOder === 'NAME' ? 'title' : 'created_at'}`]:
          typeOrder === 'ASC' ? 'ASC' : 'DESC',
      },
    });
  }

  @Get('/tags-by-author/:author')
  async tagsByAuthor(@Query('author') author: string) {}
}
