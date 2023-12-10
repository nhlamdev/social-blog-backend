import { MAIL_QUEUE, MAIL_QUEUE_SUBSCRIBE_CREATE_CONTENT } from '@/constants';
import { AccessJwtPayload } from '@/interface';
import { CommonService } from '@/service';
import { checkIsNumber } from '@/utils/global-func';
import { InjectQueue } from '@nestjs/bull';
// import { RabbitMQService } from '@/service/rabbitmq.service';
import { Controller, Get, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Queue } from 'bull';

@Controller('common')
export class CommonController {
  constructor(
    private readonly commonService: CommonService,

    @InjectQueue(MAIL_QUEUE) private queueMail: Queue,
  ) {}

  @Get('visualize')
  @ApiTags('common')
  async visualize() {
    const result = {
      visual: await this.commonService.ownerVisualizeData(),
      // status: await this.commonService.status(),
    };

    return result;
  }

  // @Get('status')
  // @ApiTags('common')
  // async() {
  //   return this.commonService.status();
  // }

  @Get('all-notify')
  @ApiTags('common')
  async setting() {
    return this.commonService.allNotify();
  }

  @Get('/notifies-by-member')
  @ApiTags('common')
  @UseGuards(AuthGuard('jwt-access'))
  async notifiesByMember(
    @Req() req,
    @Query('last') last: string,
    @Query('skip') skip: string,
  ) {
    const jwtPayload: AccessJwtPayload = req.user;
    const _last = checkIsNumber(last) ? Number(last) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;

    return this.commonService.notifiesByMember(jwtPayload, _last, _skip);
  }

  @Patch('/notifies-seen-all')
  @UseGuards(AuthGuard('jwt-access'))
  async makeSeenAllNotifies(@Req() req) {
    const jwtPayload: AccessJwtPayload = req.user;
    return this.commonService.makeSeenAllNotifies(jwtPayload);
  }

  @Get('test')
  @ApiTags('common')
  async settingUpdate() {
    this.queueMail.add(
      MAIL_QUEUE_SUBSCRIBE_CREATE_CONTENT,
      {
        emailReceive: 'lam.nh@oryza.vn',
        title: 'nhlamdev@gmail.com vừa mới đăng tải bài viết.',
        description:
          'Bài viết  Cập nhật công nghệ mùa 3 vừa được đăng tải vào lúc ngày 9/12/2023',

        context: {
          author: 'Lâm Nguyễn Hoàng',
          create_time: '2023-12-09T12:22:01.546Z',
          content_title: 'Cập nhật công nghệ mùa 3',
        },
      },
      {
        attempts: 3,
        backoff: 3000,
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }
}
