import { checkIsNumber } from '@/shared/utils/global-func';
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ILike } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';
import { CategoryService } from './category.service';
import { ContentService } from '../content/content.service';
import { CategoryDto } from './category.dto';

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly contentService: ContentService,
  ) {}

  @Get()
  async all(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
  ) {
    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;

    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    return await this.categoryService.findAll({
      where: { title: ILike(_search) },
      take: _take,
      skip: _skip,
    });
  }

  @Get(':id')
  async categoryById(@Param('id') id: string) {
    const category = await this.categoryService.findOne({ where: { _id: id } });

    if (!Boolean(category)) {
      throw new NotFoundException('Thể loại không tồn tại!.');
    }

    return category;
  }

  @Get('more-contents')
  async topCategoryMorePublicContents() {
    const categories = await this.categoryService.findAll({
      select: { _id: true, title: true, created_at: true },
    });

    const categoriesWithCountContent = await Promise.all(
      categories.map(async (category) => {
        const count = await this.contentService.count({
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
  async create() {}

  @Put(':id')
  @UseGuards(AuthGuard('jwt-access'))
  async update(@Param('id') id: string, @Body() body: CategoryDto) {}

  @Delete(':id')
  @UseGuards(AuthGuard('jwt-access'))
  async delete(@Param('id') id: string) {
    return await this.categoryService.delete(id);
  }
}
