import { CASE_SORT } from '@/constants';
import * as cacheKey from '@/constants/cache-key';
import { MemberEntity } from '@/entities';
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
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  @ApiTags('content')
  @ApiOperation({
    summary: 'Lấy thông tin tất cả bài viết.',
  })
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

    const category_query = await this.categoryService.oneCategoryById(category);
    const series_query = await this.seriesService.oneSeriesById(series);

    const _category = Boolean(category_query) ? category_query : null;

    const _series = Boolean(series_query) ? series_query : null;

    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    return await this.contentService.manyContent({
      _take,
      _skip,
      _search,
      _category,
      _series,
      _caseSort,
    });
  }

  @Get('by-category/:id')
  @ApiTags('content')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiOperation({
    summary: 'Lấy thông tin tất cả bài viết theo thể loại.',
  })
  async getContentByCategory(
    @Query('skip') skip: string,
    @Query('take') take: string,
    @Query('search') search: string | undefined,
    @Query('outside') outside: string | undefined,
    @Param('id') id: string,
    @Req() req,
  ) {
    const member: MemberEntity = req.user;

    if (!member.role.owner) {
      throw new ForbiddenException('Bạn không có quyền hạn thao tác.');
    }

    const category = await this.categoryService.oneCategoryById(id);

    if (!Boolean(category)) {
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
  @UseGuards(AuthGuard('jwt-access'))
  @ApiOperation({
    summary: 'Lấy thông tin tất cả bài viết theo chuỗi bài viết.',
  })
  async getContentBySeries(
    @Query('skip') skip: string,
    @Query('take') take: string,
    @Query('search') search: string | undefined,
    @Query('outside') outside: string | undefined,
    @Param('id') id: string,
    @Req() req,
  ) {
    const member: MemberEntity = req.user;

    if (!member.role.owner && !member.role.author) {
      throw new ForbiddenException('Bạn không có quyền hạn thao tác.');
    }

    const series = this.seriesService.oneSeriesById(id);

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

    return this.contentService.contentBySeries(
      _take,
      _skip,
      _search,
      id,
      outside,
      member,
    );
  }

  @Get('count-content')
  // @UseGuards(AuthGuard('jwt-access'))
  @ApiTags('content')
  @ApiOperation({
    summary: 'Số lượng bài viết tổng.',
  })
  async countContents() {
    const status = await this.cacheManager.get(cacheKey.COUNT_STATUS);

    if (status) {
      return status;
    } else {
      const countContent = await this.contentService.countContent();
      const seriesContent = await this.seriesService.countSeries();
      const categoryCount = await this.categoryService.countCategory();
      const result = await {
        content: countContent,
        series: seriesContent,
        category: categoryCount,
      };

      await this.cacheManager.set(cacheKey.COUNT_STATUS, result);

      return result;
    }
  }

  @Get('random')
  @ApiTags('content')
  @ApiOperation({
    summary: 'Bài viết ngẫu nhiên',
  })
  async randomContent(@Query('take') take: string | undefined) {
    const _take = checkIsNumber(take) ? Number(take) : null;

    return this.contentService.randomContents(_take);
  }

  @Get('by-member/:id')
  @ApiTags('content')
  @ApiOperation({
    summary: 'Bài viết ngẫu nhiên',
  })
  async getContentByMember(
    @Param('id') id: string,
    @Query('skip') skip: string,
    @Query('take') take: string,
    @Query('search') search: string | undefined,
  ) {
    const member = await this.authService.oneMemberById(id);

    if (!Boolean(member)) {
      throw new BadRequestException('Thành viên không tồn tại.');
    }

    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;
    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    return await this.contentService.manyContentByMember({
      member,
      status: 'view',
      _take,
      _skip,
      _search,
    });
  }

  @Get('owner')
  @ApiTags('content')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiOperation({
    summary: 'Bài viết ngẫu nhiên',
  })
  async getContentByCreateOwner(
    @Req() req,
    @Query('skip') skip: string,
    @Query('take') take: string,
    @Query('search') search: string | undefined,
  ) {
    const member: MemberEntity = req.user;

    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;
    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    return await this.contentService.manyContentByMember({
      member,
      status: 'owner',
      _take,
      _skip,
      _search,
    });
  }

  @Get('by-id/:id/owner')
  @ApiTags('content')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiOperation({
    summary: 'Lấy thông tin bài viết được chỉ định.',
  })
  async getContentByIdOwner(@Param('id') id: string, @Req() req) {
    if (!validateUUID(id)) {
      throw new BadRequestException('Id bài viết sai định dạng.');
    }
    const member: MemberEntity = req.user;

    const content = await this.contentService.oneContentById(id, 'owner');

    if (!Boolean(content)) {
      throw new BadRequestException('Không tìm thấy bài viết');
    }

    if (content.created_by._id !== member._id) {
      throw new ForbiddenException('Bạn không phải chủ nhân bài viết!.');
    }

    const result = {
      ...content,
      countComment: await this.commentService.countCommentByContent(content),
    };

    return result;
  }

  @Get('by-id/:id')
  @ApiTags('content')
  @ApiOperation({
    summary: 'Lấy thông tin bài viết được chỉ định.',
  })
  async getContentByIdClient(@Param('id') id: string) {
    if (!validateUUID(id)) {
      throw new BadRequestException('Id bài viết sai định dạng.');
    }

    const content = await this.contentService.oneContentById(id, 'view');

    if (!Boolean(content)) {
      throw new BadRequestException('Không tìm thấy bài viết');
    }

    await this.contentService.upCountViewContent(content);

    const result = {
      ...content,
      countComment: await this.commentService.countCommentByContent(content),
    };

    return result;
  }

  @Get('more-view')
  @ApiTags('content')
  @ApiOperation({
    summary: 'All posts sorted by views!',
  })
  async contentsTopView(@Query('take') take: string | undefined) {
    const _take = checkIsNumber(take) ? Number(take) : null;

    return await this.contentService.topViewContent({
      _take,
    });
  }

  @Get('more-view/owner')
  @ApiTags('content')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiOperation({
    summary: 'All posts sorted by views!',
  })
  async contentsTopViewOwner(
    @Query('take') take: string | undefined,
    @Req() req,
  ) {
    const member: MemberEntity = req.user;
    const _take = checkIsNumber(take) ? Number(take) : null;

    return await this.contentService.topViewContent({
      _take,
      member,
    });
  }

  @Get('all-author')
  @ApiTags('content')
  @ApiOperation({
    summary: 'All authors!',
  })
  async allAuththor(
    @Query('skip') skip: string,
    @Query('take') take: string,
    @Query('search') search: string | undefined,
  ) {
    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;
    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';
    const { data: members, count: total } =
      await this.authService.manyMemberWidthCountContent(_take, _skip, _search);

    const membersWidthContents = await members.map(async (member) => {
      const count = await this.contentService.countContentByMember(member);

      const memberWithCountContent = { ...member, countContent: count };
      return memberWithCountContent;
    });
    return [await Promise.all(membersWidthContents), total];
  }

  @Get('more-comments')
  @ApiTags('content')
  @ApiOperation({
    summary: 'All posts sorted by comment count!',
  })
  async getTopContentsMoreComments(
    @Query('take') take: string | undefined,
    @Req() req,
  ) {
    const jwtPayload: AccessJwtPayload = req.user;
    const _take = checkIsNumber(take) ? Number(take) : null;

    const member = await this.authService.oneMemberById(jwtPayload._id);

    if (Boolean(member)) {
      return await this.contentService.contentsMoreComments(_take);
    } else {
      return await this.contentService.contentsMoreComments(_take);
    }
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
    const member: MemberEntity = req.user;

    if (!member.role.author && !member.role.owner) {
      throw new ForbiddenException('Bạn không có quyền thêm mới bài viết!.');
    }

    const filesData = await this.commonService.saveFile(files);

    if (filesData.length === 0) {
      throw new BadRequestException('Bạn chưa chọn ảnh.');
    }

    return await this.contentService.create(body, member);
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
  ) {
    const member: MemberEntity = req.user;

    const content = await this.contentService.oneContentById(id, 'owner');

    if (!Boolean(content)) {
      throw new BadRequestException('Bài viết cần chỉnh sửa không tồn tại.');
    }

    if (!member.role.author && !member.role.owner) {
      throw new ForbiddenException(
        'Bạn không có quyền thao tác với bài viết!.',
      );
    }

    if (content.created_by._id !== member._id) {
      throw new ForbiddenException(
        'Bạn không phải là người tạo ra bài viết này.',
      );
    }

    return await this.contentService.updateContent(id, payload);
  }

  @Patch('note-content/:id')
  @UseGuards(AuthGuard('jwt-access'))
  async noteContent(
    @Req() req,
    @Query('case') caseAction: string,
    @Param('contentId') contentId: string,
  ) {
    const member: MemberEntity = req.user;

    if (!['add', 'remove'].includes(caseAction)) {
      throw new BadRequestException('loại thao tác không chuẩn.');
    }

    const content = await this.contentService.oneContentById(contentId, 'view');

    if (!content) {
      throw new BadRequestException('Bài viết không tồn tại');
    }

    return await this.contentService.noteContent(
      content,
      member,
      caseAction as any,
    );
  }

  @Patch('update-category/:content/:category')
  @ApiTags('content')
  @UseGuards(AuthGuard('jwt-access'))
  async updateCategory(
    @Param('content') content: string,
    @Param('category') category: string,
    @Req() req,
  ) {
    const member: MemberEntity = req.user;

    if (!member.role.owner) {
      throw new ForbiddenException('Bạn không có quyền thao tác.');
    }

    const _content = await this.contentService.oneContentById(content, 'owner');

    if (!_content) {
      throw new BadRequestException('bài viết không tồn tại.');
    }

    const _category = await this.categoryService.oneCategoryById(category);

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
    @Req() req,
  ) {
    const member: MemberEntity = req.user;

    const _content = await this.contentService.oneContentById(content, 'owner');

    if (!_content) {
      throw new BadRequestException('bài viết không tồn tại.');
    }

    const _series = await this.seriesService.oneSeriesById(series);

    if (!_series) {
      throw new BadRequestException('chuỗi bài viết không tồn tại.');
    }

    if (
      _content.created_by._id !== member._id ||
      _series.created_by._id !== member._id
    ) {
      throw new ForbiddenException('Bạn không có quyền thao tác');
    }

    return await this.contentService.changeSeries(_content, _series);
  }

  @Delete(':id')
  @ApiTags('content')
  @UseGuards(AuthGuard('jwt-access'))
  async deleteContent(@Param('id') id: string, @Req() req) {
    const member: MemberEntity = req.user;

    const _content = await this.contentService.oneContentById(id, 'owner');

    if (!Boolean(_content)) {
      throw new BadRequestException('bài viết không tồn tại.');
    }

    if (_content.created_by._id !== member._id) {
      throw new ForbiddenException('Bạn không có quyền xoá bài viết này');
    }

    return await this.contentService.delete(id);
  }
}
