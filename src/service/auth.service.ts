import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberEntity, SessionEntity } from '@/entities';
import { Repository } from 'typeorm';
import { client_data } from '@/interface/common.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(SessionEntity)
    private sessionRepository: Repository<SessionEntity>,
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
  ) {}

  async allMember(_take: number, _skip: number, _search: string) {
    return this.memberRepository
      .createQueryBuilder('member')
      .skip(_skip)
      .take(_take)
      .where('LOWER(member.name) LIKE :search', { search: _search })
      .getMany();
  }

  async memberById(id: string) {
    return this.memberRepository.findOne({ where: { _id: id } });
  }

  async sessionById(session_id: string) {
    return this.sessionRepository.findOne({ where: { _id: session_id } });
  }

  async removeSession(id?: string) {
    if (id) {
      return this.sessionRepository.delete({ _id: id });
    } else {
      return this.sessionRepository.delete({});
    }
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
      member.name = payload.name;
      member.email = payload.email;

      if (payload.image) {
        member.image = payload.image;
      }

      this.memberRepository.save(member);

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

  async createSession(payload: {
    client: client_data;
    member?: MemberEntity;
    role?: 'member' | 'owner';
    provider: 'google' | 'github' | 'discord';
  }) {
    const newSession = new SessionEntity();

    const { client } = payload;

    newSession.member = payload.member;
    newSession.provider = payload.provider;

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

  async certificateLogin() {}
}
