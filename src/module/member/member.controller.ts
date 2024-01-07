import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RedisClientType } from 'redis';
import { MemberService } from './member.service';

@ApiTags('members')
@Controller()
export class MemberController {
  constructor(
    private readonly memberService: MemberService,
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
  ) {}

  @Get('member')
  async keys() {
    const memberIds = await this.memberService.findAll();

    const members = await Promise.all(
      memberIds.map(async (member) => {
        const info = await this.redisClient.HGETALL(
          `member-info-${member._id}`,
        );

        const role = await this.redisClient.HGETALL(
          `member-role-${member._id}`,
        );

        const followers = await this.redisClient.SMEMBERS(
          `member-follow-${member._id}`,
        );
        return { ...info, role, followers };
      }),
    );

    return members;
  }
}
