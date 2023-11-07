import { CASE_SORT } from '@/constants';
import * as cacheKey from '@/constants/cache-key';
import { AccessJwtPayload } from '@/interface';
import { ContentDto } from '@/model';
import {
  AuthService,
  CategoryService,
  CommentService,
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
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  // UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { validate as validateUUID } from 'uuid';

@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly categoryService: CategoryService,
    private readonly commentService: CommentService,
    private readonly seriesService: SeriesService,
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  @ApiTags('content')
  @ApiOperation({
    summary: 'Lấy thông tin tất cả bài viết.',
  })
  async contents(
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

    return await this.contentService.manyPublicContent({
      _take,
      _skip,
      _search,
      _category,
      _series,
      _caseSort,
    });
  }

  @Get('my-saved')
  @ApiTags('content')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiOperation({
    summary: 'Lấy thông tin tất cả bài viết đã lưu của cá nhân.',
  })
  async mySavedContent(
    @Req() req,
    @Query('skip') skip: string,
    @Query('take') take: string,
    @Query('search') search: string | undefined,
  ) {
    const jwtPayload: AccessJwtPayload = req.user;
    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;
    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    return await this.contentService.manyAndCountContentMemberSave(jwtPayload, {
      _take,
      _skip,
      _search,
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
    const jwtPayload: AccessJwtPayload = req.user;

    if (!jwtPayload.role_owner) {
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
    const jwtPayload: AccessJwtPayload = req.user;

    const series = await this.seriesService.oneSeriesById(id);

    if (!series) {
      throw new BadRequestException('Chuỗi bài viết không tồn tại.');
    }

    if (
      !jwtPayload.role_owner &&
      (!jwtPayload.role_author || series.created_by._id !== jwtPayload._id)
    ) {
      throw new ForbiddenException('Bạn không có quyền hạn thao tác.');
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
      jwtPayload,
    );
  }

  @Get('count-result')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiTags('content')
  @ApiOperation({
    summary: 'Số lượng bài viết tổng.',
  })
  async countContents(@Req() req) {
    const jwtPayload: AccessJwtPayload = req.user;

    if (!jwtPayload.role_owner) {
      throw new BadRequestException('Bạn không có quyền thao tác.');
    }

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
    summary: 'theo tác giả',
  })
  async getContentByMember(
    @Param('id') id: string,
    @Query('skip') skip: string,
    @Query('take') take: string,
    @Query('search') search: string | undefined,
  ) {
    const member = await this.authService.oneMemberById(id);

    if (!Boolean(member)) {
      throw new BadRequestException('Thành viên không tồn tại (view)');
    }

    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;
    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    const [data, count] = await this.contentService.manyContentByMember({
      memberId: member._id,
      status: 'view',
      _take,
      _skip,
      _search,
    });

    const result = {
      contents: data.map((c) => {
        delete c.case_allow;
        delete c.complete;
        delete c.delete_at;
        delete c.body;

        return c;
      }),
      count: count,
    };

    return result;
  }

  @Get('owner')
  @ApiTags('content')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiOperation({
    summary: 'bài viết của thành viên (owner)',
  })
  async getContentByCreateOwner(
    @Req() req,
    @Query('skip') skip: string,
    @Query('take') take: string,
    @Query('search') search: string | undefined,
  ) {
    const jwtPayload: AccessJwtPayload = req.user;

    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;
    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    return await this.contentService.manyContentByMember({
      memberId: jwtPayload._id,
      _take,
      _skip,
      _search,
      status: 'owner',
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
    const jwtPayload: AccessJwtPayload = req.user;

    const isExist = await this.contentService.checkExistById(id);

    if (isExist) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }

    const content = await this.contentService.oneContentById(id);

    if (content.created_by._id !== jwtPayload._id) {
      throw new NotFoundException('Không tìm thấy bài viết');
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

    const isExist = await this.contentService.checkExistById(id);

    if (!isExist) {
      throw new NotFoundException('Bài biết không tồn tại');
    }

    const content = await this.contentService.oneContentById(id);

    if (content.case_allow === 'noly-me' || content.complete === false) {
      throw new BadRequestException('Không tìm thấy bài viết');
    }

    const result = {
      ...content,
      countComment: await this.commentService.countCommentByContent(content),
    };

    delete result.case_allow;
    delete result.complete;
    delete result.delete_at;
    delete result.updated_at;

    await this.contentService.upCountViewContent(content);

    return result;
  }

  @Get('more-view')
  @ApiTags('content')
  @ApiOperation({
    summary: 'All posts sorted by views!',
  })
  async contentsTopView(@Query('take') take: string | undefined) {
    const _take = checkIsNumber(take) ? Number(take) : null;

    return await this.contentService.topViewPublicContent({
      _take,
    });
  }

  @Get('more-view/owner')
  @ApiTags('content')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiOperation({
    summary: 'All posts sorted by views!',
  })
  async contentsTopViewOwner(@Query('take') take: string | undefined) {
    const _take = checkIsNumber(take) ? Number(take) : null;

    return await this.contentService.topViewAllContent({
      _take,
    });
  }

  @Get('all-author')
  @ApiTags('content')
  @ApiOperation({
    summary: 'All authors!',
  })
  async allAuthors(
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
      await this.authService.manyMemberWidthCountContent(
        _take,
        _skip,
        _search,
        false,
      );

    const membersWidthContents = await members.map(async (member) => {
      const count = await this.contentService.countContentByMember(member._id);

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
  async getTopContentsMoreComments(@Query('take') take: string | undefined) {
    const _take = checkIsNumber(take) ? Number(take) : null;

    return await this.contentService.manyContentMoreComments(_take);
  }

  @Post()
  @ApiTags('content')
  @UseGuards(AuthGuard('jwt-access'))
  async createContents(@Body() body: ContentDto, @Req() req) {
    const jwtPayload: AccessJwtPayload = req.user;

    if (!jwtPayload.role_author && !jwtPayload.role_owner) {
      throw new ForbiddenException('Bạn không có quyền thêm mới bài viết!.');
    }

    return await this.contentService.create(body, jwtPayload._id);
  }

  @Put(':id')
  @ApiTags('content')
  @UseGuards(AuthGuard('jwt-access'))
  async update(
    @Body() payload: ContentDto,
    @Param('id') id: string,
    @Req() req,
  ) {
    const jwtPayload: AccessJwtPayload = req.user;

    const isExist = await this.contentService.checkExistById(id);

    if (!isExist) {
      throw new NotFoundException('Bài viết cần chỉnh sửa không tồn tại.');
    }

    const content = await this.contentService.oneContentById(id);

    if (!jwtPayload.role_author && !jwtPayload.role_owner) {
      throw new ForbiddenException(
        'Bạn không có quyền thao tác với bài viết!.',
      );
    }

    if (content.created_by._id !== jwtPayload._id) {
      throw new ForbiddenException(
        'Bạn không phải là người tạo ra bài viết này.',
      );
    }

    return await this.contentService.updateContent(id, payload, content);
  }

  @Patch('save-content/:contentId')
  @ApiTags('content')
  @UseGuards(AuthGuard('jwt-access'))
  async saveContent(
    @Req() req,
    @Query('case') caseAction: string,
    @Param('contentId') contentId: string,
  ) {
    const jwtPayload: AccessJwtPayload = req.user;

    if (!['add', 'remove'].includes(caseAction)) {
      throw new BadRequestException('loại thao tác không chuẩn.');
    }

    const isExist = await this.contentService.checkExistById(contentId);

    if (!isExist) {
      throw new NotFoundException('Bài viết cần chỉnh sửa không tồn tại.');
    }

    const content = await this.contentService.oneContentById(contentId);

    return await this.contentService.saveContent(
      content,
      jwtPayload,
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
    const jwtPayload: AccessJwtPayload = req.user;

    if (!jwtPayload.role_owner) {
      throw new ForbiddenException('Bạn không có quyền thao tác.');
    }

    const isExistContent = await this.contentService.checkExistById(content);

    if (!isExistContent) {
      throw new NotFoundException('bài viết không tồn tại.');
    }

    const isExistCategory = await this.categoryService.checkExistById(category);

    if (!isExistCategory) {
      throw new NotFoundException('thể loại không tồn tại.');
    }

    const _content = await this.contentService.oneContentById(content);

    const _category = await this.categoryService.oneCategoryById(category);

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

    const isExistContent = await this.contentService.checkExistById(content);

    if (!isExistContent) {
      throw new NotFoundException('bài viết không tồn tại.');
    }

    const isExistSeries = await this.seriesService.checkExistById(series);

    if (!isExistSeries) {
      throw new BadRequestException('chuỗi bài viết không tồn tại.');
    }

    const _content = await this.contentService.oneContentById(content);

    const _series = await this.seriesService.oneSeriesById(series);

    if (
      _content.created_by._id !== jwtPayload._id ||
      _series.created_by._id !== jwtPayload._id
    ) {
      throw new ForbiddenException('Bạn không có quyền thao tác');
    }

    return await this.contentService.changeSeries(_content, _series);
  }

  @Delete(':id')
  @ApiTags('content')
  @UseGuards(AuthGuard('jwt-access'))
  async deleteContent(@Param('id') id: string, @Req() req) {
    const jwtPayload: AccessJwtPayload = req.user;

    const isExist = await this.contentService.checkExistById(id);

    if (!isExist) {
      throw new NotFoundException('Bài viết cần chỉnh sửa không tồn tại.');
    }

    const _content = await this.contentService.oneContentById(id);

    if (_content.created_by._id !== jwtPayload._id) {
      throw new ForbiddenException('Bạn không có quyền xoá bài viết này');
    }

    return await this.contentService.delete(id);
  }
}
