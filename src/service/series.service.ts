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

  /**
   * Kiểm tra xem tiêu đề của chuỗi bài viết đã tồn tại hay chưa
   * @param {string} title - tiêu đề cần check
   * @returns {boolean} - Hàm trả về true nếu tồn tại, ngược lại trả về false.
   */
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

  async getContentMoreAvgViewContent(take: number | null) {
    return await this.seriesRepository
      .createQueryBuilder('series')
      .leftJoinAndSelect('series.contents', 'contents')
      .select(
        'series._id, series.title, ROUND (COUNT(contents.count_view) / COUNT(contents._id)) as contentCountView',
      )
      .groupBy('series._id')
      .having('COUNT(contents._id) > 0')
      .orderBy('contentCountView', 'DESC')
      .limit(take)
      .getRawMany();
  }

  async create(payload: SeriesDto, member: MemberEntity) {
    const series = new SeriesEntity();

    series.title = payload.title;
    series.summary = payload.summary;
    series.created_by = member;
    return this.seriesRepository.save(series);
  }

  async getAllSeries(payload: {
    member?: MemberEntity;
    _take: number;
    _skip: number;
    _search: string;
    status: 'owner' | 'member';
  }) {
    const query = this.seriesRepository
      .createQueryBuilder('series')
      .leftJoinAndSelect('series.created_by', 'created_by')
      .skip(payload._skip)
      .take(payload._take)
      .where(`LOWER(series.title) LIKE :search`, {
        search: payload._search,
      });

    const series = payload.member
      ? await query
          .andWhere('created_by._id = :member', { member: payload.member._id })
          .orderBy('series.created_at', 'DESC')
          .getMany()
      : await query.orderBy('series.created_at', 'DESC').getMany();

    const seriesWithCountContent = series.map(async (series) => {
      const countContent = await this.contentRepository
        .createQueryBuilder('content')
        .where('content.series = :series', { series: series._id })
        .getCount();

      return { ...series, contents: countContent };
    });

    const max = await query.getCount();

    const result = {
      data: await Promise.all(seriesWithCountContent),
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
