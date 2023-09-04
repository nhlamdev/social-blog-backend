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

  async checkNameExist(title: string) {
    const data = await this.categoryRepository.findOne({
      where: { title: title },
    });

    return Boolean(data);
  }

  async countCategory() {
    return await this.categoryRepository.count();
  }

  async getCategoryById(id: string) {
    return await this.categoryRepository
      .createQueryBuilder('category')
      .where('category._id = :id', { id: id })
      .getOne();
  }

  async getTopCategoryMoreContents() {
    return await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.contents', 'contents')
      .addSelect('COUNT(contents.id)', 'contentCount')
      .select(
        'category._id, category.title, COUNT(contents._id) as contentCount',
      )
      .groupBy('category._id')
      .orderBy('contentCount', 'DESC')
      .getRawMany();
  }

  async create(payload: CategoryDto) {
    const category = new CategoryEntity();

    category.title = payload.title;
    category.summary = payload.summary;
    return this.categoryRepository.save(category);
  }

  async getAllCategory(_take: number, _skip: number, _search: string) {
    const query = this.categoryRepository
      .createQueryBuilder('category')
      .skip(_skip)
      .take(_take)
      .where('LOWER(category.title) LIKE :search ', { search: _search });

    const categories = await query
      .orderBy('category.created_at', 'DESC')
      .getMany();

    const categoriesWithCountContent = categories.map(async (category) => {
      const countContent = await this.contentRepository
        .createQueryBuilder('content')
        .where('content.category = :category', { category: category._id })
        .getCount();

      return { ...category, contents: countContent };
    });

    const max = await query.getCount();

    const result = {
      data: await Promise.all(categoriesWithCountContent),
      max: max,
    };

    return result;
  }

  async update(id: string, body: CategoryDto) {
    return await this.categoryRepository.update(id, body);
  }

  async delete(id: string) {
    this.categoryRepository.softDelete(id);
  }
}
