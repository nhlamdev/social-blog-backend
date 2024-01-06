import { MemberEntity } from '@/database/entities';
import { ISocialPayload } from '@/types';
import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { MemberService } from '.';

@Injectable()
export class AuthService {
  constructor(
    private readonly memberService: MemberService,
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
  ) {}
  async socialVerifyExist(payload: ISocialPayload) {
    const membersKeys = await this.redisClient.KEYS('member-info');

    for (const key of membersKeys) {
      const member = await this.redisClient.HGETALL(key);

      if (member.email === payload.email) {
        return member;
      }
    }

    const newMember = new MemberEntity();
    newMember.name = payload.name;
    newMember.email = payload.email;
    return await this.memberService.create(newMember);
  }
}
