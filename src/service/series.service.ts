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
  async checkExistByTitle(title: string) {
    return await this.seriesRepository.exist({
      where: { title: title },
    });
  }

  async checkExistById(id) {
    return await this.seriesRepository.exist({
      where: { _id: id },
    });
  }

  async countSeries() {
    return await this.seriesRepository.count();
  }

  async oneSeriesById(id: string) {
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
      .leftJoinAndSelect('series.created_by', 'created_by')
      .select(
        `series._id, series.title,created_by.name as created_name,created_by.image as created_image, created_by.email as created_email,
        COUNT(contents._id) as content_count, SUM(contents.count_view) as contents_total_views,
        ROUND(SUM(contents.count_view) / COUNT(contents._id)) as contents_avg_view`,
      )
      .where('contents.case_allow = :caseAllow', { caseAllow: 'public' })
      .andWhere('contents.complete = :isComplete', {
        isComplete: true,
      })
      .groupBy(
        'series._id, series.title,created_by.name,created_by.image,created_by.email',
      )
      .having('COUNT(contents._id) > 0')
      .andHaving('SUM(contents.count_view) > 0')
      .orderBy('contents_avg_view', 'DESC')
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

  async manySeries(payload: {
    memberId?: string;
    _take: number;
    _skip: number;
    _search: string;
    _author?: string;
  }) {
    const query = this.seriesRepository
      .createQueryBuilder('series')
      .leftJoinAndSelect('series.created_by', 'created_by')
      .skip(payload._skip)
      .take(payload._take)
      .where(`LOWER(series.title) LIKE :search`, {
        search: payload._search,
      });

    const authorFilter = payload._author
      ? query.andWhere('created_by._id = :author', { author: payload._author })
      : query;

    const series = payload.memberId
      ? await authorFilter
          .andWhere('created_by._id = :member', {
            member: payload.memberId,
          })
          .orderBy('series.created_at', 'DESC')
          .getMany()
      : await authorFilter.orderBy('series.created_at', 'DESC').getMany();

    const seriesWithCountContent = series.map(async (series) => {
      if (payload.memberId) {
        const countContent = await this.contentRepository.count({
          where: {
            series: { _id: series._id },
            created_by: { _id: payload.memberId },
          },
        });

        return { ...series, contents: countContent };
      } else {
        const countContent = await this.contentRepository.count({
          where: {
            series: { _id: series._id },
            case_allow: 'public',
            complete: true,
          },
        });
        return { ...series, contents: countContent };
      }
    });

    const max = await authorFilter.getCount();

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
