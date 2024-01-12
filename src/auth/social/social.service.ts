import { MemberEntity } from '@/module/member/member.entity';
import { MemberService } from '@/module/member/member.service';
import { ISocialPayload } from '@/shared/types';
import { Injectable } from '@nestjs/common';
@Injectable()
export class SocialService {
  constructor(private readonly memberService: MemberService) {}
  async socialVerifyExist(payload: ISocialPayload) {
    const member = await this.memberService.findOne({
      where: { email: payload.email },
    });

    if (member) {
      return member;
    } else {
      const newMember = new MemberEntity();
      newMember.name = payload.name;
      newMember.email = payload.email;
      return await this.memberService.create(newMember);
    }
  }
}
