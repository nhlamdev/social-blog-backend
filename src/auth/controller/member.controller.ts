import { AccessJwtPayload } from '@/interface';
import { checkIsNumber } from '@/utils/global-func';
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MemberService } from '../service/member.service';

@Controller()
export class MemberController {
  constructor(private readonly memberService: MemberService) {}
  @Get('profile')
  @ApiTags('member-auth')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiOperation({
    summary: 'Lấy thông tin cá nhân.',
  })
  async profile(@Req() req) {
    const jwtPayload: AccessJwtPayload = req.user;

    return jwtPayload;
  }

  @Get('member-follow/:id')
  @ApiTags('member-auth')
  @ApiOperation({
    summary: 'Lấy thông tin cá nhân.',
  })
  async membersFollow(@Param('id') id: string) {
    return await this.memberService.findFullInfoMemberFollow(id);
  }

  @Post('contact')
  @ApiTags('member-auth')
  @ApiOperation({
    summary: 'Báo cáo.',
  })
  @UseGuards(AuthGuard('jwt-access'))
  async contact() {}

  // @Put('change')
  // @ApiTags('member-auth')
  // @UseGuards(AuthGuard('jwt-access'))
  // @UseInterceptors(
  //   FilesInterceptor('files', 20, {
  //     storage: diskStorage({
  //       destination: (req, file, next) => {
  //         next(null, 'uploads');
  //       },
  //       filename: (req, file, next) => {
  //         next(
  //           null,
  //           new Date().toISOString().replace(/:/g, '-') +
  //             '-' +
  //             file.originalname,
  //         );
  //       },
  //     }),
  //   }),
  // )
  // @ApiOperation({
  //   summary: 'Thay đổi thông tin cá nhân của thành viên.',
  // })
  // async updateProfile(
  //   @UploadedFile('files') files: Express.Multer.File,
  //   @Req() req,
  //   @Body() body: ProfileDto,
  // ) {
  //   const jwtPayload: AccessJwtPayload = req.user;

  //   const filesData = await this.commonService.saveFile(files);

  //   if (!body.name && filesData.length === 0) {
  //     throw new BadRequestException('Dữ liệu không thay đổi.');
  //   }

  //   return await this.memberService.updateProfile({
  //     id: jwtPayload._id,
  //     image: filesData.length !== 0 ? filesData[0].fileName : undefined,
  //     name: body.name ? body.name : undefined,
  //   });
  // }

  @Patch('update-follow/:targetAuthor')
  @ApiTags('member-auth')
  @UseGuards(AuthGuard('jwt-access'))
  async handleFollowContent(
    @Param('targetAuthor') targetAuthor: string,
    @Req() req,
  ) {
    const jwtPayload: AccessJwtPayload = req.user;

    const isExist = await this.memberService.checkMemberExistById(targetAuthor);

    if (!isExist) {
      throw new NotFoundException('Tác giả không tồn tại.');
    }

    return await this.memberService.UpdateMemberFollow(
      jwtPayload,
      targetAuthor,
    );
  }

  @Get('all-members')
  @ApiTags('member-auth')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiOperation({
    summary: 'Lấy thông tin tất cả thành viên (owner).',
  })
  async allMembers(
    @Query('skip') skip: string,
    @Query('take') take: string,
    @Query('search') search: string | undefined,
    @Req() req,
  ) {
    const jwtPayload: AccessJwtPayload = req.user;

    const member = await this.memberService.oneMemberById(jwtPayload._id);

    if (!member.role_owner) {
      throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');
    }

    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;
    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    const { data: membersWitthRole, count } =
      await this.memberService.manyMemberWidthCountContent(
        _take,
        _skip,
        _search,
        true,
      );

    const result = { data: membersWitthRole, count };

    return result;
  }

  @Get('author/:id')
  @ApiTags('member-auth')
  @ApiOperation({
    summary: 'Lấy thông tin cá nhân của một tác giả.',
  })
  async authorById(@Param('id') id: string) {
    const member = await this.memberService.oneMemberById(id);

    if (!Boolean(member)) {
      throw new BadRequestException('Thành viên không tồn tại.');
    }

    return member;
  }

  @Patch('change-role/:memberId')
  @ApiTags('member-auth')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiOperation({
    summary: 'Thay đổi quyền của thành viên.',
  })
  async updateRoleMember(
    @Param('memberId') memberId: string,
    @Body() payload: { key: string; value: boolean },
    @Req() req,
  ) {
    const jwtPayload: AccessJwtPayload = req.user;

    if (!jwtPayload.role_owner) {
      throw new BadRequestException('Quyền không hợp lệ.');
    }
    if (!['comment', 'author', 'owner'].includes(payload.key)) {
      throw new BadRequestException('Quyền không hợp lệ');
    }
    if (typeof payload.value !== 'boolean') {
      throw new BadRequestException('Loại không hợp lệ');
    }

    const memberUpdate = await this.memberService.oneMemberById(memberId);

    if (payload.key === 'author') {
      memberUpdate.role_author = payload.value;
    }

    if (payload.key === 'comment') {
      memberUpdate.role_comment = payload.value;
    }

    if (payload.key === 'owner') {
      memberUpdate.role_owner = payload.value;
    }
    // console.log(memberUpdate);
    // console.log('memberUpdate : ', memberUpdate);

    return await this.memberService.updateRole(memberUpdate);
  }
}
