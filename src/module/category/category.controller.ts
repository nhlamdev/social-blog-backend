import { PaginationDto } from '@/shared/dto/paginate.dto';
import { IAccessJwtPayload } from '@/shared/types';
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
import { ContentService } from '../content/content.service';
import { CategoryDto } from './category.dto';
import { CategoryService } from './category.service';

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly contentService: ContentService,
  ) {}

  @Get()
  async categories() {
    const categories = await this.categoryService.repository.find({
      order: { created_at: 'DESC' },
    });

    return categories;
  }

  @Get('paginate')
  async paginate(@Query() query: PaginationDto) {
    const [categories, count] =
      await this.categoryService.repository.findAndCount({
        where: { title: query.search ? ILike(query.search) : undefined },
        take: query.take,
        skip: query.skip,
        order: { created_at: 'DESC' },
      });

    return { categories, count };
  }

  @Get('owner/paginate')
  @UseGuards(AuthGuard('jwt-access'))
  async ownerPaginate(@Req() req, @Query() query: PaginationDto) {
    const jwtPayload: IAccessJwtPayload = req.user;

    if (!jwtPayload.role.owner) {
      throw new ForbiddenException('Bạn không có quyền thao tác');
    }

    const [categories, count] =
      await this.categoryService.repository.findAndCount({
        where: { title: query.search ? ILike(query.search) : undefined },
        take: query.take,
        skip: query.skip,
        order: { created_at: 'DESC' },
      });

    const categoriesWithCountContent = categories.map(async (c) => {
      const count = await this.contentService.repository.count({
        where: { category: { _id: c._id } },
        relations: { category: true },
      });

      return { ...c, contents: count };
    });

    return { categories: await Promise.all(categoriesWithCountContent), count };
  }

  @Get('by-id/:id')
  async categoryById(@Param('id') id: string) {
    const category = await this.categoryService.repository.findOne({
      where: { _id: id },
    });

    if (!Boolean(category)) {
      throw new NotFoundException('Thể loại không tồn tại!.');
    }

    return category;
  }

  @Get('more-contents')
  async topCategoryMorePublicContents() {
    const categories = await this.categoryService.repository.find({
      select: { _id: true, title: true, created_at: true },
    });

    const categoriesWithCountContent = await Promise.all(
      categories.map(async (category) => {
        const count = await this.contentService.repository.count({
          where: {
            category: { _id: category._id },
            public: true,
            complete: true,
          },
          relations: { category: true },
        });

        return { ...category, contentCount: count };
      }),
    );

    return categoriesWithCountContent.sort(
      (a, b) => b.contentCount - a.contentCount,
    );
  }

  @Post()
  @UseGuards(AuthGuard('jwt-access'))
  async create(@Req() req, @Body() body: CategoryDto) {
    const jwtPayload: IAccessJwtPayload = req.user;

    if (!jwtPayload.role.owner) {
      throw new ForbiddenException('Bạn không có quyền hạn');
    }

    await this.categoryService.repository.create(body);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt-access'))
  async update(@Req() req, @Param('id') id: string, @Body() body: CategoryDto) {
    const jwtPayload: IAccessJwtPayload = req.user;

    if (!jwtPayload.role.owner) {
      throw new ForbiddenException('Bạn không có quyền hạn');
    }

    await this.categoryService.repository.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt-access'))
  async delete(@Req() req, @Param('id') id: string) {
    const jwtPayload: IAccessJwtPayload = req.user;

    if (!jwtPayload.role.owner) {
      throw new ForbiddenException('Bạn không có quyền hạn');
    }

    return await this.categoryService.repository.delete(id);
  }
}
