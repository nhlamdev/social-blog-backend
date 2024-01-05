import { Controller, Get, Inject } from '@nestjs/common';
import { MemberService } from '../service/member.service';
import { ApiTags } from '@nestjs/swagger';
import { RedisClientType } from 'redis';

@ApiTags('members')
@Controller()
export class MemberController {
  constructor(
    private readonly memberService: MemberService,
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
  ) {}

  @Get('member')
  async keys() {
    const memberId = await this.memberService.findAll({
      select: { _id: true },
    });

    const members = await Promise.all(
      memberId.map(async (member) => {
        return await this.redisClient.HGETALL(`member:${member._id}`);
      }),
    );

    return members;
  }
}
