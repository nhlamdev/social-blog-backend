import { Controller } from '@nestjs/common';
import { MemberService } from '../service/member.service';

@Controller()
export class MemberController {
  constructor(private readonly memberService: MemberService) {}
}
