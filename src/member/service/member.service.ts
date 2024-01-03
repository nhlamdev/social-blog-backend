import { ContentEntity, MemberEntity, SeriesEntity } from '@/post/entities';
import { AccessJwtPayload } from '@/interface';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisClientType } from 'redis';
import { Repository } from 'typeorm';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
    @InjectRepository(SeriesEntity)
    private seriesRepository: Repository<SeriesEntity>,
    @InjectRepository(ContentEntity)
    private contentRepository: Repository<ContentEntity>,
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
  ) {}

  async allMembers() {
    return await this.memberRepository.find();
  }

  async findMemberFollowedByAuthor(authorTarget: string) {
    const queryResult = await this.memberRepository
      .createQueryBuilder('member')
      .select('member.follow_by')
      .where('member._id = :authorTarget ', { authorTarget: authorTarget })
      .getOne();

    return queryResult.follow_by;
  }

  async findFullInfoMemberFollow(id: string) {
    const ids = await this.findMemberFollowedByAuthor(id);
    const members = ids.map(async (item) => {
      return await this.memberRepository.findOne({ where: { _id: item } });
    });

    return await Promise.all(members);
  }

  async UpdateMemberFollow(jwtPayload: AccessJwtPayload, authorTarget: string) {
    const memberFollowed = await this.findMemberFollowedByAuthor(authorTarget);

    if (memberFollowed.includes(jwtPayload._id)) {
      await this.memberRepository.update(authorTarget, {
        follow_by: memberFollowed.filter((m) => m !== jwtPayload._id),
      });
    } else {
      await this.memberRepository.update(authorTarget, {
        follow_by: [...memberFollowed, jwtPayload._id],
      });
    }
  }

  async checkMemberExistById(member_id: string) {
    return await this.memberRepository.exist({ where: { _id: member_id } });
  }

  async oneMemberById(id: string) {
    return this.memberRepository.findOne({
      where: { _id: id },
    });
  }

  async updateProfile(payload: { id: string; name?: string; image?: string }) {
    if (payload.name || payload.name) {
      return await this.memberRepository.update(payload.id, {
        name: payload.name,
        image: payload.image,
      });
    }
  }

  async manyMemberWidthCountContent(
    _take: number,
    _skip: number,
    _search: string,
    isOwner: boolean,
  ) {
    const query = await this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.contents', 'contents')
      .skip(_skip)
      .take(_take)
      .where('LOWER(member.name) LIKE :search', { search: _search });

    const members = isOwner
      ? await query
          .select([
            'member._id',
            'member.name',
            'member.email',
            'member.image',
            'member.created_at',
            'member.follow_by',
            'member.role_comment',
            'member.role_author',
            'member.role_owner',
          ])
          .getMany()
      : await query
          .select([
            'member._id',
            'member.name',
            'member.email',
            'member.follow_by',
            'member.image',
            'member.created_at',
          ])
          .getMany();

    const membersWidthCountContents = await Promise.all(
      members.map(async (c) => {
        if (isOwner) {
          const content_count = await this.contentRepository.count({
            where: { created_by: c._id },
          });

          const series_count = await this.seriesRepository.count({
            where: { created_by: c._id },
          });

          return { ...c, content_count, series_count };
        } else {
          const content_count = await this.contentRepository.count({
            where: {
              created_by: c._id,
              public: true,
              complete: true,
            },
          });

          const series_count = await this.seriesRepository.count({
            where: { created_by: c._id },
          });

          return { ...c, content_count, series_count };
        }
      }),
    );

    const count = await this.memberRepository.count();

    const result = { data: membersWidthCountContents, count };

    return result;
  }

  async updateRole(member: MemberEntity) {
    await this.memberRepository.save(member);
  }
}
