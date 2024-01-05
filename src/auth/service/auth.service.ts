import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor() {}
  async socialVerifyExist() {
    // } // id: string; // image: string | null; // email: string; // name: string; // provider: 'google' | 'github' | 'facebook' | 'discord'; // payload: {
    // const member = await this.memberRepository.findOne({
    //   where: { email: payload.email },
    // });
    // if (member) {
    //   return member;
    // } else {
    //   const newMember = new MemberEntity();
    //   newMember.name = payload.name;
    //   newMember.email = payload.email;
    //   return await this.memberRepository.save(newMember);
    // }
  }
}
