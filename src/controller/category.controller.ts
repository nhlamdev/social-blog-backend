import { CategoryDto } from '@/model';
import { CategoryService } from '@/service';
import { checkIsNumber } from '@/utils/global-func';
import {
  BadRequestException,
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
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  @Get()
  @ApiTags('category')
  async getCategory(
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

    return await this.categoryService.getAllCategory(_take, _skip, _search);
  }

  @Post()
  @ApiTags('category')
  @UseGuards(AuthGuard('jwt-access'))
  async createCategory(@Body() body: CategoryDto) {
    const isExist = await this.categoryService.checkNameExist(body.title);

    if (isExist) {
      throw new NotFoundException('Thể loại đã tồn tại.');
    }

    return this.categoryService.create(body);
  }

  @Put(':id')
  @ApiTags('category')
  @UseGuards(AuthGuard('jwt-access'))
  async updateCategory(@Body() body: CategoryDto, @Param('id') id: string) {
    const category = await this.categoryService.getCategoryById(id);

    if (!category) {
      throw new BadRequestException('Thể loại cần chỉnh sửa không tồn tại.!');
    }

    return this.categoryService.update(category._id, body);
  }

  @Delete(':id')
  @ApiTags('category')
  @UseGuards(AuthGuard('jwt-access'))
  async deleteCategory(@Param('id') id: string) {
    const category = await this.categoryService.getCategoryById(id);

    if (!category) {
      throw new BadRequestException('Thể loại cần xoá không tồn tại.!');
    }

    return await this.categoryService.delete(id);
  }
}
