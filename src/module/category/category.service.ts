import { CategoryRepository } from './category.repository';

export class CategoryService extends CategoryRepository {
  async test() {
    this.findAllAndCount();
  }
}
