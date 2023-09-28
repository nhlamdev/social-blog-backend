import { CASE_SORT } from '@/constants';
import { AccessJwtPayload } from '@/interface';
import { ContentDto } from '@/model';
import {
  AuthService,
  CategoryService,
  CommentService,
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
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  // UploadedFile,
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
    private readonly commentService: CommentService,
    private readonly seriesService: SeriesService,
    private readonly commonService: CommonService,
    private readonly authService: AuthService,
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

    return this.contentService.randomContents(_take);
  }

  @Get('top')
  @ApiTags('content')
  async contentsTopView(@Query('take') take: string | undefined) {
    const _take = checkIsNumber(take) ? Number(take) : null;
    return this.contentService.topViewContent(_take);
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

    const content = await this.contentService.getContentById(id);

    if (!Boolean(content)) {
      throw new BadRequestException('Không tìm thấy bài viết');
    }

    const result = {
      ...content,
      countComment: await this.commentService.countCommentByContent(content),
    };

    return result;
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
    @Req() req,
    @UploadedFile('files') files: Express.Multer.File,
  ) {
    const jwtPayload: AccessJwtPayload = req.user;

    const member = await this.authService.memberById(jwtPayload._id);
    if (!Boolean(member)) {
      throw new BadRequestException('Thành  viên không tồn tại.');
    }

    if (member.role === 'member') {
      throw new ForbiddenException('Bạn không có quyền thêm mới bài viết!.');
    }

    const filesData = await this.commonService.saveFile(files);

    if (filesData.length === 0) {
      throw new BadRequestException('Bạn chưa chọn ảnh.');
    }

    return await this.contentService.create(body, member, filesData[0]);
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
  async update(
    @Body() payload: ContentDto,
    @Param('id') id: string,
    @Req() req,
    @UploadedFile('files') files: Express.Multer.File,
  ) {
    const jwtPayload: AccessJwtPayload = req.user;

    const content = await this.contentService.getContentById(id);

    if (!Boolean(content)) {
      throw new BadRequestException('Bài viết cần chỉnh sửa không tồn tại.');
    }

    const member = await this.authService.memberById(jwtPayload._id);

    if (!Boolean(member)) {
      throw new BadRequestException('Thành viện không tồn tại');
    }

    if (member.role === 'member') {
      throw new ForbiddenException(
        'Bạn không có quyền thao tác với bài viết!.',
      );
    }

    if (content.created_by._id !== member._id) {
      throw new ForbiddenException(
        'Bạn không phải là người tạo ra bài viết này.',
      );
    }

    const filesData = await this.commonService.saveFile(files);

    if (filesData.length === 0) {
      throw new BadRequestException('Bạn chưa chọn ảnh.');
    }

    return await this.contentService.updateContent(id, payload, filesData[0]);
  }

  @Patch('update-category/:content/:category')
  @ApiTags('content')
  @UseGuards(AuthGuard('jwt-access'))
  async updateCategory(
    @Param('content') content: string,
    @Param('category') category: string,
    @Req() req,
  ) {
    const jwtPayload: AccessJwtPayload = req.user;

    const member = await this.authService.memberById(jwtPayload._id);

    if (!Boolean(member)) {
      throw new BadRequestException('Thành  viên không tồn tại.');
    }

    const _content = await this.contentService.getContentById(content);

    if (!_content) {
      throw new BadRequestException('bài viết không tồn tại.');
    }

    const _category = await this.categoryService.getCategoryById(category);

    if (!_category) {
      throw new BadRequestException('thể loại không tồn tại.');
    }

    if (_content._id !== member._id || _category._id !== member._id) {
      throw new ForbiddenException('Bạn không có quyền thao tác');
    }

    return await this.contentService.changeCategory(_content, _category);
  }

  @Patch('update-series/:content/:series')
  @ApiTags('content')
  @UseGuards(AuthGuard('jwt-access'))
  async updateSeries(
    @Param('content') content: string,
    @Param('series') series: string,
    @Req() req,
  ) {
    const jwtPayload: AccessJwtPayload = req.user;

    const member = await this.authService.memberById(jwtPayload._id);

    if (!Boolean(member)) {
      throw new BadRequestException('Thành  viên không tồn tại.');
    }

    const _content = await this.contentService.getContentById(content);

    if (!_content) {
      throw new BadRequestException('bài viết không tồn tại.');
    }

    const _series = await this.seriesService.getSeriesById(series);

    if (!_series) {
      throw new BadRequestException('chuỗi bài viết không tồn tại.');
    }

    if (_content._id !== member._id || _series._id !== member._id) {
      throw new ForbiddenException('Bạn không có quyền thao tác');
    }

    return await this.contentService.changeSeries(_content, _series);
  }

  @Delete(':id')
  @ApiTags('content')
  @UseGuards(AuthGuard('jwt-access'))
  async deleteContent(@Param('id') id: string, @Req() req) {
    const jwtPayload: AccessJwtPayload = req.user;

    const member = await this.authService.memberById(jwtPayload._id);

    if (!Boolean(member)) {
      throw new BadRequestException('Thành  viên không tồn tại.');
    }

    const _content = await this.contentService.getContentById(id);

    if (!Boolean(_content)) {
      throw new BadRequestException('bài viết không tồn tại.');
    }

    if (_content.created_by._id !== member._id) {
      throw new ForbiddenException('Bạn không có quyền xoá bài viết này');
    }

    return await this.contentService.delete(id);
  }
}
