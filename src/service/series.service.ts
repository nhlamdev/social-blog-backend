import { ContentEntity, MemberEntity } from '@/entities';
import { SeriesDto } from '@/model/series.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeriesEntity } from '@/entities';

@Injectable()
export class SeriesService {
  constructor(
    @InjectRepository(SeriesEntity)
    private seriesRepository: Repository<SeriesEntity>,
    @InjectRepository(ContentEntity)
    private contentRepository: Repository<ContentEntity>,
  ) {}

  async checkNameExist(title: string) {
    const data = await this.seriesRepository.findOne({
      where: { title: title },
    });

    return Boolean(data);
  }

  async countSeries() {
    return await this.seriesRepository.count();
  }

  async getSeriesById(id: string) {
    return await this.seriesRepository
      .createQueryBuilder('series')
      .leftJoinAndSelect('series.created_by', 'created_by')
      .where('series._id = :id', { id: id })
      .getOne();
  }

  async create(payload: SeriesDto, member: MemberEntity) {
    const series = new SeriesEntity();

    series.title = payload.title;
    series.summary = payload.summary;
    series.created_by = member;
    return this.seriesRepository.save(series);
  }

  async getAllSeries(_take: number, _skip: number, _search: string) {
    const query = this.seriesRepository
      .createQueryBuilder('series')
      .leftJoinAndSelect('series.created_by', 'created_by')
      .skip(_skip)
      .take(_take)
      .where('LOWER(series.title) LIKE :search ', { search: _search });

    const categories = await query
      .orderBy('series.created_at', 'DESC')
      .getMany();

    const categoriesWithCountContent = categories.map(async (series) => {
      const countContent = await this.contentRepository
        .createQueryBuilder('content')
        .where('content.series = :series', { series: series._id })
        .getCount();

      return { ...series, contents: countContent };
    });

    const max = await query.getCount();

    const result = {
      data: await Promise.all(categoriesWithCountContent),
      max: max,
    };

    return result;
  }

  async update(id: string, body: SeriesDto) {
    return await this.seriesRepository.update(id, body);
  }

  async delete(id: string) {
    this.seriesRepository.softDelete(id);
  }
}
