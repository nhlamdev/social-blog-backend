import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberEntity, RoleEntity, SessionEntity } from '@/entities';
import { Repository } from 'typeorm';
import { client_data } from '@/interface/common.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    @InjectRepository(SessionEntity)
    private sessionRepository: Repository<SessionEntity>,
    @InjectRepository(MemberEntity)
    private memberRepository: Repository<MemberEntity>,
  ) {}

  async allMemberWidthCountContent(
    _take: number,
    _skip: number,
    _search: string,
  ) {
    const data = await this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.contents', 'contents')
      .leftJoinAndSelect('member.role', 'role')
      .select(
        `member._id,member.name,member.email,member.image,role.comment,role.owner,role.author,member.created_at,
        COUNT(contents._id) as content_count`,
      )
      .groupBy(
        'member._id,member.name,member.email,member.image,member.created_at,role.comment,role.owner,role.author',
      )
      .skip(_skip)
      .take(_take)
      .where('LOWER(member.name) LIKE :search', { search: _search })
      .getRawMany();

    const count = await this.memberRepository.count();

    const result = { data, count };

    return result;
  }

  async memberById(id: string) {
    return this.memberRepository.findOne({
      where: { _id: id },
      relations: { role: true },
    });
  }

  async memberByIdWidthRole(_id: string) {
    return this.memberRepository.findOne({
      where: { _id },
      relations: { role: true },
    });
  }

  async sessionById(session_id: string) {
    return this.sessionRepository.findOne({
      where: { _id: session_id },
      relations: { member: true },
    });
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
      const role = new RoleEntity();
      await this.roleRepository.save(role);

      newMember.name = payload.name;
      newMember.email = payload.email;
      newMember.role = role;

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
  }) {
    const newSession = new SessionEntity();

    const { client } = payload;

    newSession.member = payload.member;
    newSession.provider = payload.provider;
    newSession.provider_id = payload.provider_id;

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
