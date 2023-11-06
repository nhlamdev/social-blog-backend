import { AccessJwtPayload } from '@/interface';
import { CategoryDto } from '@/model';
import { AuthService, CategoryService, CommonService } from '@/service';
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

@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly commonService: CommonService,
    private readonly authService: AuthService,
  ) {}
  @Get()
  @ApiTags('category')
  @ApiOperation({
    summary: 'Lấy thông tin tất cả thể loại.',
  })
  async categories(
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

    return await this.categoryService.manyCategory(_take, _skip, _search);
  }

  @Get('by-id/:id')
  @ApiTags('category')
  @ApiOperation({
    summary: 'Lấy thông tin thể loại theo id.',
  })
  async categoryById(@Param('id') id: string) {
    const isExist = await this.categoryById(id);

    if (isExist) {
      throw new NotFoundException('Thể loại không tồn tại!.');
    }

    const category = await this.categoryService.oneCategoryById(id);

    return category;
  }

  @Get('more-contents')
  @ApiTags('category')
  @ApiOperation({
    summary: 'Lấy thông tin tất cả thể loại sắp xếp theo số lượng bài viết.',
  })
  async getTopCategoryMoreContents(@Query('take') take: string | undefined) {
    const _take = checkIsNumber(take) ? Number(take) : null;
    return await this.categoryService.topCategoryMorePublicContents(_take);
  }

  @Post()
  @ApiTags('category')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiOperation({
    summary: 'Tạo mới một thể loại.',
  })
  async createCategory(@Body() body: CategoryDto, @Req() req) {
    const jwtPayload: AccessJwtPayload = req.user;

    if (!jwtPayload.role_owner) {
      throw new ForbiddenException(
        'Bạn không có quyền thao tác với thể loại!.',
      );
    }

    const isExist = await this.categoryService.checkExistByName(body.title);

    if (isExist) {
      throw new NotFoundException('Tiêu dề thể loại đã tồn tại.');
    }

    return await this.categoryService.create(body);
  }

  @Put(':id')
  @ApiTags('category')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiOperation({
    summary: 'Chỉnh sửa bài viết được chỉ định.',
  })
  async updateCategory(
    @Body() body: CategoryDto,
    @Param('id') id: string,
    @Req() req,
  ) {
    const jwtPayload: AccessJwtPayload = req.user;

    if (!jwtPayload.role_owner) {
      throw new ForbiddenException(
        'Bạn không có quyền thao tác với thể loại!.',
      );
    }

    const category = await this.categoryService.oneCategoryById(id);

    if (!category) {
      throw new BadRequestException('Thể loại cần chỉnh sửa không tồn tại.!');
    }

    return this.categoryService.update(category, body);
  }

  @Delete(':id')
  @ApiTags('category')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiOperation({
    summary: 'Xóa bài viết được chỉ định.',
  })
  async deleteCategory(@Param('id') id: string, @Req() req) {
    const jwtPayload: AccessJwtPayload = req.user;

    if (!jwtPayload.role_owner) {
      throw new ForbiddenException(
        'Bạn không có quyền thao tác với thể loại!.',
      );
    }

    const isExist = await this.categoryService.checkExistById(id);

    if (!isExist) {
      throw new BadRequestException('Thể loại cần xoá không tồn tại.!');
    }

    return await this.categoryService.delete(id);
  }
}
