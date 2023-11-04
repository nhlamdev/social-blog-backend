import { MemberEntity, SessionEntity } from '@/entities';
import { client_data } from '@/interface/common.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(SessionEntity)
    private sessionRepository: Repository<SessionEntity>,
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
  ) {}

  async checkSessionExist(session_id: string) {
    return await this.sessionRepository.exist({ where: { _id: session_id } });
  }

  async checkSessionExistByMember(session_id: string, member_id: string) {
    return await this.sessionRepository.exist({
      where: { _id: session_id, member: { _id: member_id } },
    });
  }

  async manySessionByMemberId(id: string) {
    return await this.sessionRepository.find({
      where: { member: { _id: id } },
    });
  }

  async oneSessionById(session_id: string) {
    return await this.sessionRepository.findOne({
      where: { _id: session_id },
      relations: { member: true },
    });
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
    this.memberRepository.update(payload.id, {
      name: payload.name,
      image: payload.image,
    });
  }

  async manyMemberWidthCountContent(
    _take: number,
    _skip: number,
    _search: string,
  ) {
    const data = await this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.contents', 'contents')
      .select(
        `member._id,member.name,member.email,member.image,member.created_at,
        COUNT(contents._id) as content_count`,
      )
      .groupBy(
        'member._id,member.name,member.email,member.image,member.created_at',
      )
      .skip(_skip)
      .take(_take)
      .where('LOWER(member.name) LIKE :search', { search: _search })
      .getRawMany();

    const count = await this.memberRepository.count();

    const result = { data, count };

    return result;
  }

  async socialVerifyExist(payload: {
    provider: 'google' | 'github' | 'facebook' | 'discord';
    name: string;
    email: string;
    image: string | null;
    id: string;
  }) {
    const member = await this.memberRepository.findOne({
      where: { email: payload.email },
    });

    if (member) {
      return member;
    } else {
      const newMember = new MemberEntity();

      newMember.name = payload.name;
      newMember.email = payload.email;
      if (payload.image) {
        newMember.image = payload.image;
      }

      return await this.memberRepository.save(newMember);
    }
  }

  async updateRole(member: MemberEntity) {
    await this.memberRepository.save(member);
  }

  async createSession(payload: {
    client: client_data;
    member?: MemberEntity;
    provider: 'google' | 'github' | 'discord';
    provider_id: string;
    sessionAge: number;
  }) {
    const newSession = new SessionEntity();

    const { client } = payload;

    newSession.member = payload.member;
    newSession.provider = payload.provider;
    newSession.provider_id = payload.provider_id;
    newSession.age = payload.sessionAge.toString();

    if (client.device) {
      newSession.device = client.device;
    }

    if (client.browser && client.browser.name && client.browser.version) {
      newSession.browser = `${client.browser.name} ${client.browser.version}`;
    }

    if (client.ip) {
      newSession.ip = client.ip;
    }

    if (client.os && client.os.name && client.os.version) {
      newSession.os = `${client.os.name} ${client.os.version}`;
    }

    return this.sessionRepository.save(newSession);
  }

  async removeSession(criteria: string | string[]) {
    return this.sessionRepository.delete(criteria);
  }

  async removeSessionAnother(criteria: string) {
    const sessionAnother = await this.sessionRepository
      .createQueryBuilder('session')
      .where('session._id <> :id', { id: criteria })
      .getMany();

    return await this.sessionRepository.delete(
      sessionAnother.map((v) => v._id),
    );
  }
}
