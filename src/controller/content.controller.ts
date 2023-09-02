import { CASE_SORT } from '@/constants';
import { ContentDto } from '@/model';
import {
  CategoryService,
  CommonService,
  ContentService,
  SeriesService,
} from '@/service';
import { checkIsNumber } from '@/utils/global-func';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { validate as validateUUID } from 'uuid';
@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly categoryService: CategoryService,
    private readonly seriesService: SeriesService,
    private readonly commonService: CommonService,
  ) {}

  @Get('count-content')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiTags('content')
  async countContents() {
    const countContent = await this.contentService.countContent();
    const seriesContent = await this.seriesService.countSeries();
    const categoryCount = await this.categoryService.countCategory();
    const result = await {
      content: countContent,
      series: seriesContent,
      category: categoryCount,
    };
    return result;
  }

  @Get('random')
  @ApiTags('content')
  async randomContent(@Query('take') take: string | undefined) {
    const _take = checkIsNumber(take) ? Number(take) : null;

    return this.contentService.randonContents(_take);
  }

  @Get()
  @ApiTags('content')
  async getContents(
    @Query('skip') skip: string,
    @Query('take') take: string,
    @Query('search') search: string | undefined,
    @Query('category') category: string | undefined,
    @Query('series') series: string | undefined,
    @Query('sortCase') caseSort: string | undefined,
  ) {
    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;
    const _caseSort = CASE_SORT.includes(caseSort) ? caseSort : CASE_SORT[0];

    const category_query = await this.categoryService.getCategoryById(category);
    const series_query = await this.seriesService.getSeriesById(series);

    const _category = Boolean(category_query) ? category_query : null;

    const _series = Boolean(series_query) ? series_query : null;

    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    return await this.contentService.getAllContent(
      _take,
      _skip,
      _search,
      _category,
      _series,
      _caseSort,
      true,
    );
  }

  @Get('owner')
  @ApiTags('content')
  @UseGuards(AuthGuard('jwt-access'))
  async getContentsAdmin(
    @Query('skip') skip: string,
    @Query('take') take: string,
    @Query('search') search: string | undefined,
    @Query('category') category: string | undefined,
    @Query('series') series: string | undefined,
    @Query('sortCase') caseSort: string | undefined,
  ) {
    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;
    const _caseSort = CASE_SORT.includes(caseSort) ? caseSort : CASE_SORT[0];

    const category_query = await this.categoryService.getCategoryById(category);
    const series_query = await this.seriesService.getSeriesById(series);

    const _category = Boolean(category_query) ? category_query : null;

    const _series = Boolean(series_query) ? series_query : null;

    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    return await this.contentService.getAllContent(
      _take,
      _skip,
      _search,
      _category,
      _series,
      _caseSort,
      false,
    );
  }

  @Get('by-category/:id')
  @ApiTags('content')
  async getContentByCategory(
    @Query('skip') skip: string,
    @Query('take') take: string,
    @Query('search') search: string | undefined,
    @Query('outside') outside: string | undefined,
    @Param('id') id: string,
  ) {
    const category = this.categoryService.getCategoryById(id);

    if (!category) {
      throw new BadRequestException('Thể loại không tồn tại.');
    }

    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;

    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    return this.contentService.getContentByCategory(
      _take,
      _skip,
      _search,
      id,
      outside,
    );
  }

  @Get('by-series/:id')
  @ApiTags('content')
  async getContentBySeries(
    @Query('skip') skip: string,
    @Query('take') take: string,
    @Query('search') search: string | undefined,
    @Query('outside') outside: string | undefined,
    @Param('id') id: string,
  ) {
    const series = this.seriesService.getSeriesById(id);

    if (!series) {
      throw new BadRequestException('Chuỗi bài viết không tồn tại.');
    }

    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;

    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    return this.contentService.getContentBySeries(
      _take,
      _skip,
      _search,
      id,
      outside,
    );
  }

  @Get(':id')
  @ApiTags('content')
  async getContentById(@Param('id') id: string) {
    if (!validateUUID(id)) {
      throw new BadRequestException('Id bài viết sai định dạng.');
    }

    return await this.contentService.getContentById(id);
  }

  @Post()
  @ApiTags('content')
  @UseGuards(AuthGuard('jwt-access'))
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: diskStorage({
        destination: (req, file, next) => {
          next(null, 'uploads');
        },
        filename: (req, file, next) => {
          next(
            null,
            new Date().toISOString().replace(/:/g, '-') +
              '-' +
              file.originalname,
          );
        },
      }),
    }),
  )
  async createContents(
    @Body() body: ContentDto,
    @UploadedFile('files') files: Express.Multer.File,
  ) {
    const filesData = await this.commonService.saveFile(files);

    return await this.contentService.create(body, filesData);
  }

  @Put(':id')
  @ApiTags('content')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: diskStorage({
        destination: (req, file, next) => {
          next(null, 'uploads');
        },
        filename: (req, file, next) => {
          next(
            null,
            new Date().toISOString().replace(/:/g, '-') +
              '-' +
              file.originalname,
          );
        },
      }),
    }),
  )
  @UseGuards(AuthGuard('jwt-access'))
  async updateBody(
    @Body() payload: ContentDto,
    @Param('id') id: string,
    @UploadedFile('files') files: Express.Multer.File,
  ) {
    const { title, body, tags, category, complete } = payload;
    const filesData = await this.commonService.saveFile(files);

    return await this.contentService.updateContent(
      id,
      {
        title,
        body,
        tags,
        category,
        complete,
      },
      filesData,
    );
  }

  @Patch('update-category/:content/:category')
  @ApiTags('content')
  @UseGuards(AuthGuard('jwt-access'))
  async updateCategory(
    @Param('content') content: string,
    @Param('category') category: string,
  ) {
    const _content = await this.contentService.getContentById(content);

    if (!_content) {
      throw new BadRequestException('bài viết không tồn tại.');
    }

    const _category = await this.categoryService.getCategoryById(category);

    if (!_category) {
      throw new BadRequestException('thể loại không tồn tại.');
    }

    return await this.contentService.changeCategory(_content, _category);
  }

  @Patch('update-series/:content/:series')
  @ApiTags('content')
  @UseGuards(AuthGuard('jwt-access'))
  async updateSeries(
    @Param('content') content: string,
    @Param('series') series: string,
  ) {
    const _content = await this.contentService.getContentById(content);

    if (!_content) {
      throw new BadRequestException('bài viết không tồn tại.');
    }

    const _series = await this.seriesService.getSeriesById(series);

    if (!_series) {
      throw new BadRequestException('chuỗi bài viết không tồn tại.');
    }

    return await this.contentService.changeSeries(_content, _series);
  }

  @Delete(':id')
  @ApiTags('content')
  @UseGuards(AuthGuard('jwt-access'))
  async deleteContent(@Param('id') id: string) {
    return await this.contentService.delete(id);
  }
}
