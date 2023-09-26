import { CategoryDto } from '@/model';
import { CategoryService, CommonService } from '@/service';
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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';

@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly commonService: CommonService,
  ) {}
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

  @Get('more-contents')
  @ApiTags('category')
  async getTopCategoryMoreContents(@Query('take') take: string | undefined) {
    const _take = checkIsNumber(take) ? Number(take) : null;
    return await this.categoryService.getTopCategoryMoreContents(_take);
  }

  @Post()
  @ApiTags('category')
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
  async createCategory(
    @Body() body: CategoryDto,
    @UploadedFile('files') files: Express.Multer.File,
  ) {
    const filesData = await this.commonService.saveFile(files);

    const isExist = await this.categoryService.checkNameExist(body.title);

    if (isExist) {
      throw new NotFoundException('Thể loại đã tồn tại.');
    }

    if (filesData.length === 0) {
      throw new BadRequestException('Bạn chưa chọn ảnh.');
    }

    return this.categoryService.create(body, filesData[0]);
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
