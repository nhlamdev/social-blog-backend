import { MemberEntity, SessionEntity } from '@/post/entities';
import { client_data } from '@/interface';
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
      where: { _id: session_id, created_by: member_id },
    });
  }

  async oneSessionByMember(session_id: string, member_id: string) {
    return await this.sessionRepository.findOne({
      where: { _id: session_id, created_by: member_id },
    });
  }

  async oneSessionById(session_id: string) {
    return await this.sessionRepository.findOne({
      where: { _id: session_id },
    });
  }

  async manySessionByMemberId(member_id: string, _take: number, _skip: number) {
    const data = await this.sessionRepository.find({
      where: { created_by: member_id },
      take: _take,
      skip: _skip,
    });

    const count = await this.sessionRepository.count({
      where: { created_by: member_id },
      take: _take,
      skip: _skip,
    });

    return { data, count };
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

      return await this.memberRepository.save(newMember);
    }
  }

  async createSession(payload: {
    client: client_data;
    member_id: string;
    provider: 'google' | 'github' | 'discord';
    provider_id: string;
    sessionAge: number;
  }) {
    const newSession = new SessionEntity();

    const { client } = payload;

    newSession.created_by = payload.member_id;
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
