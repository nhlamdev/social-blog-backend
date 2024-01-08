import {
  Controller,
  ForbiddenException,
  Get,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { MaybeType } from '@/shared/utils/types/maybe.type';
import { checkIsNumber } from '@/shared/utils/global-func';
import { AuthGuard } from '@nestjs/passport';
import { IAccessJwtPayload } from '@/shared/types';

@Controller('notification')
@ApiTags('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @Get()
  @UseGuards(AuthGuard('jwt-access'))
  async notifies(
    @Req() req,
    @Query('skip') skip: MaybeType<string>,
    @Query('take') take: MaybeType<string>,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    if (!jwtPayload.role.owner) {
      throw new ForbiddenException('Bạn không có quyền thao tác');
    }

    const _take = checkIsNumber(take) ? Number(take) : undefined;
    const _skip = checkIsNumber(skip) ? Number(skip) : undefined;

    const notifies = await this.notificationService.findAll({
      take: _take,
      skip: _skip,
    });

    const unSeen = await this.notificationService.count({
      where: { seen: false },
    });

    return { notifies, unSeen };
  }

  @Get('notifies-by-member')
  @UseGuards(AuthGuard('jwt-access'))
  async notifiesByMember(
    @Req() req,
    @Query('last') last: string,
    @Query('skip') skip: string,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _take = checkIsNumber(last) ? Number(last) : undefined;
    const _skip = checkIsNumber(skip) ? Number(skip) : undefined;

    const notifies = await this.notificationService.findAll({
      where: { to: jwtPayload._id },
      take: _take,
      skip: _skip,
    });

    const unSeen = await this.notificationService.count({
      where: { to: jwtPayload._id, seen: false },
    });

    return { notifies, unSeen };
  }

  @Patch('notifies-seen-all')
  @UseGuards(AuthGuard('jwt-access'))
  async makeSeenAllNotifies(@Req() req) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const notifies = await this.notificationService.findAll({
      select: { _id: true },
      where: { to: jwtPayload._id },
    });

    return this.notificationService.update(
      notifies.map((v) => v._id),
      { seen: true },
    );
  }
}
