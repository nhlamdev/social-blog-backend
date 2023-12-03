import { CategoryEntity, ContentEntity } from '@/entities';
import { CategoryDto } from '@/model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(ContentEntity)
    private contentRepository: Repository<ContentEntity>,
  ) {}

  async checkExistByName(title: string) {
    return await this.categoryRepository.exist({
      where: { title: title },
    });
  }

  async checkExistById(id: string) {
    return await this.categoryRepository.exist({ where: { _id: id } });
  }

  async countCategory() {
    return await this.categoryRepository.count();
  }

  async oneCategoryById(id: string) {
    return await this.categoryRepository
      .createQueryBuilder('category')
      .where('category._id = :id', { id: id })
      .getOne();
  }

  async topCategoryMorePublicContents(take: number | null) {
    return await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.contents', 'contents')
      .addSelect('COUNT(contents.id)', 'contentCount')
      .select(
        'category._id, category.title, COUNT(contents._id) as contentCount',
      )
      .where('contents.public = true AND contents.complete = true')
      .groupBy('category._id')
      .orderBy('contentCount', 'DESC')
      .limit(take)
      .getRawMany();
  }

  async create(payload: CategoryDto) {
    const category = new CategoryEntity();
    category.title = payload.title;
    category.summary = payload.summary;
    return this.categoryRepository.save(category);
  }

  async manyCategory(_take: number, _skip: number, _search: string) {
    const query = this.categoryRepository
      .createQueryBuilder('category')
      .skip(_skip)
      .take(_take)
      .where('LOWER(category.title) LIKE :search ', { search: _search });

    const categories = await query
      .orderBy('category.created_at', 'DESC')
      .getMany();

    const categoriesWithCountContent = categories.map(async (category) => {
      const countContent = await this.contentRepository.count({
        where: {
          category: { _id: category._id },
          public: true,
          complete: true,
        },
      });

      delete category.delete_at;
      delete category.index;

      return { ...category, contents: countContent };
    });

    const max = await query.getCount();

    const result = {
      data: await Promise.all(categoriesWithCountContent),
      max: max,
    };

    return result;
  }

  async update(category: CategoryEntity, body: CategoryDto) {
    category.title = body.title;
    category.summary = body.summary;

    return await this.categoryRepository.save(category);
  }

  async delete(id: string) {
    this.categoryRepository.softDelete(id);
  }
}
