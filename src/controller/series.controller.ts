import { AccessJwtPayload } from '@/interface';
import { SeriesDto } from '@/model';
import { AuthService, SeriesService } from '@/service';
import { checkIsNumber } from '@/utils/global-func';
import {
  BadRequestException,
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
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('series')
export class SeriesController {
  constructor(
    private readonly seriesService: SeriesService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @ApiTags('content-series')
  @ApiOperation({
    summary: 'Lấy thông tin tất cả chuỗi bài viết.',
  })
  async getSeries(
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

    return await this.seriesService.manySeries({
      _take,
      _skip,
      _search,
      status: 'member',
    });
  }

  @Get('by-id/:id')
  @ApiTags('content-series')
  @ApiOperation({
    summary: 'Lấy thông tin chuỗi bài viết được chỉ định.',
  })
  async getSeriesById(@Param('id') id: string) {
    try {
      return this.seriesService.oneSeriesById(id);
    } catch (error) {
      throw new NotFoundException('Chuỗi bài viết không tồn tại.');
    }
  }

  @Get('by-member/:id')
  @ApiTags('content-series')
  @ApiOperation({
    summary: 'Lấy thông tin chuỗi bài viết theo người tạo.',
  })
  async getSeriesByMember(
    @Param('id') id: string,
    @Query('skip') skip: string,
    @Query('take') take: string,
    @Query('search') search: string | undefined,
  ) {
    const member = await this.authService.oneMemberById(id);

    if (!Boolean(member)) {
      throw new BadRequestException('Thành viên không tồn tại.!');
    }

    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;

    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    return await this.seriesService.manySeries({
      _take,
      _skip,
      _search,
      member,
      status: 'member',
    });
  }

  @Get('owner')
  @ApiTags('content-series')
  @ApiOperation({
    summary: 'Lấy thông tin chuỗi bài viết theo người tạo có chỉnh sửa.',
  })
  @UseGuards(AuthGuard('jwt-access'))
  async getSeriesByMemberOwner(
    @Query('skip') skip: string,
    @Query('take') take: string,
    @Query('search') search: string | undefined,
    @Req() req,
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

    const member = await this.authService.oneMemberById(jwtPayload._id);

    return await this.seriesService.manySeries({
      _take,
      _skip,
      _search,
      member,
      status: 'owner',
    });
  }

  @Get('more-avg-views-content')
  @ApiTags('content-series')
  @ApiOperation({
    summary: 'Lấy thông tin chuỗi bài viết có trung bình lượt xem cao nhất.',
  })
  async getSeriesMoreAvgViewContent(@Query('take') take: string | undefined) {
    const _take = checkIsNumber(take) ? Number(take) : null;
    return this.seriesService.getContentMoreAvgViewContent(_take);
  }

  @Post()
  @ApiTags('content-series')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiOperation({
    summary: 'Tạo mới một chuỗi bài viết.',
  })
  async createSeries(@Body() body: SeriesDto, @Req() req) {
    const jwtPayload: AccessJwtPayload = req.user;

    const member = await this.authService.oneMemberById(jwtPayload._id);

    if (!member?.role_author && !member?.role_owner) {
      throw new ForbiddenException(
        'Bạn không có quyền thao tác với chuỗi bài viết!.',
      );
    }

    const isExist = await this.seriesService.checkExistByTitle(body.title);

    if (isExist) {
      throw new NotFoundException('Thể loại đã tồn tại.');
    }

    return this.seriesService.create(body, member);
  }

  @Put(':id')
  @ApiTags('content-series')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiOperation({
    summary: 'Chỉnh sửa chuỗi bài viết chỉ định.',
  })
  async updateSeries(
    @Body() body: SeriesDto,
    @Param('id') id: string,
    @Req() req,
  ) {
    const jwtPayload: AccessJwtPayload = req.user;

    const member = await this.authService.oneMemberById(jwtPayload._id);

    if (!member?.role_owner && !member?.role_author) {
      throw new ForbiddenException(
        'Bạn không có quyền thao tác với chuỗi bài viết!',
      );
    }

    const series = await this.seriesService.oneSeriesById(id);

    if (!series) {
      throw new BadRequestException('Thể loại cần chỉnh sửa không tồn tại!');
    }

    if (member._id !== series.created_by._id) {
      throw new ForbiddenException(
        'Bạn không phải là người tạo của chuỗi bài viết này!',
      );
    }

    return this.seriesService.update(series._id, body);
  }

  @Delete(':id')
  @ApiTags('content-series')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiOperation({
    summary: 'Xóa chuỗi bài viết chỉ định.',
  })
  async deleteSeries(@Param('id') id: string, @Req() req) {
    const jwtPayload: AccessJwtPayload = req.user;

    const member = await this.authService.oneMemberById(jwtPayload._id);

    if (!member?.role_author && !member?.role_owner) {
      throw new ForbiddenException(
        'Bạn không có quyền thao tác với chuỗi bài viết!.',
      );
    }

    const series = await this.seriesService.oneSeriesById(id);

    if (!series) {
      throw new BadRequestException('Thể loại cần xoá không tồn tại.!');
    }

    if (member._id !== series.created_by._id) {
      throw new ForbiddenException(
        'Bạn không phải là người tạo chuỗi bài viết này!.',
      );
    }

    return await this.seriesService.delete(id);
  }
}
