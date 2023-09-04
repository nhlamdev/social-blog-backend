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

  async socialVerifyExist(data: {
    provider: 'google' | 'github' | 'facebook' | 'discord';
    name: string;
    email: string;
    image: string | null;
    id: string;
  }) {
    const member = await this.memberRepository.findOne({
      where: { provider: data.provider, provider_id: data.id },
    });

    if (member) {
      this.memberRepository.update(member._id, {
        name: data.name,
        email: data.email,
        image: data.image,
      });

      return member;
    } else {
      const newMember = new MemberEntity();

      newMember.provider_id = data.id;
      newMember.provider = data.provider;
      newMember.name = data.name;
      newMember.email = data.email;
      newMember.image = data.image;

      return await this.memberRepository.save(newMember);
    }
  }

  async createSession(data: {
    client: client_data;
    member?: MemberEntity;
    role?: 'member' | 'owner';
  }) {
    const { client, member, role } = data;

    const newSession = new SessionEntity();

    if (member) {
      newSession.member = member;
    }

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

    if (role) {
      newSession.role = role;
    }

    return this.sessionRepository.save(newSession);
  }

  async certificateLogin() {}
}
