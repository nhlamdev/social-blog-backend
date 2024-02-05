import { MemberService } from './../member/member.service';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  Response,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { FileService } from './file.service';
import { AuthGuard } from '@nestjs/passport';
import { IAccessJwtPayload } from '@/shared/types';
import { MaybeType } from '@/shared/utils/types/maybe.type';
import { checkIsNumber } from '@/shared/utils/global-func';
import { ILike } from 'typeorm';
import { UploadFileDto } from './file.dto';

@ApiTags('files')
@Controller({
  path: 'files',
  version: '1',
})
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly memberService: MemberService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt-access'))
  async paginate(
    @Req() req,
    @Query('skip') skip: MaybeType<string>,
    @Query('take') take: MaybeType<string>,
    @Query('search') search: MaybeType<string>,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    if (!jwtPayload.role.owner) {
      throw new ForbiddenException('Bạn không có quyền hạn thao tác.');
    }

    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;
    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    const [files, count] = await this.fileService.repository.find({
      where: { fileName: ILike(_search) },
      take: _take,
      skip: _skip,
      order: { created_by: 'DESC' },
    });

    return { files, count };
  }

  @Get('by-created-member')
  @UseGuards(AuthGuard('jwt-access'))
  async byCreatedMember(
    @Req() req,
    @Query('skip') skip: MaybeType<string>,
    @Query('take') take: MaybeType<string>,
    @Query('search') search: MaybeType<string>,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _take = checkIsNumber(take) ? Number(take) : null;
    const _skip = checkIsNumber(skip) ? Number(skip) : null;
    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    const [files, count] = await this.fileService.repository.find({
      where: { fileName: ILike(_search), created_by: { _id: jwtPayload._id } },
      take: _take,
      skip: _skip,
      order: { created_by: 'DESC' },
    });

    return { files, count };
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseGuards(AuthGuard('jwt-access'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: diskStorage({
        destination: (req, file, next) => {
          next(null, 'uploads');
        },
        filename: (req, file, next) => {
          next(
            null,
            new Date().toISOString().replace(/:/g, '-') +
              '-' +
              file.originalname,
          );
        },
      }),
      fileFilter: (req, file, cb) => {
        cb(null, true);
      },
    }),
  )
  async uploadFile(
    @Req() req,
    @Body() body: UploadFileDto,
    @UploadedFile('files') files: Express.Multer.File,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const { isResize } = body;

    const member = await this.memberService.repository.findOne({
      where: { _id: jwtPayload._id },
    });

    return this.fileService.saveFile(files, member, isResize);
  }

  @Get(':path')
  @ApiParam({
    name: 'path',
    type: 'string',
  })
  download(@Param('path') path, @Response() response) {
    return response.sendFile(path, { root: './files' });
  }
}
