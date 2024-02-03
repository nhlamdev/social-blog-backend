import { IAccessJwtPayload } from '@/shared/types';
import { checkIsNumber } from '@/shared/utils/global-func';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
import { FileService } from '../file/file.service';
import { CreateQuestionDto, UpdateQuestionClosedDto } from './question.dto';
import { QuestionService } from './question.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('question')
@ApiTags('question')
export class QuestionController {
  constructor(
    private readonly questionService: QuestionService,
    private readonly fileService: FileService,
  ) {}

  @Get()
  async questions(
    @Query('skip') skip: string,
    @Query('take') take: string,
    @Query('search') search: string,
  ) {
    const _take = checkIsNumber(take) ? Number(take) : undefined;
    const _skip = checkIsNumber(skip) ? Number(skip) : undefined;
    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    const { result: questions, count } =
      await this.questionService.findAllAndCount({
        where: { title: _search },
        take: _take,
        skip: _skip,
        relations: { files: true, created_by: true },
      });

    return { questions, count };
  }

  @Get('by-id/:question')
  async targetQuestion(@Param('question') question: string) {
    const _question = await this.questionService.findOne({
      where: { _id: question },
      relations: { created_by: true, files: true },
    });

    if (!_question) {
      throw new Error('Không tìm thấy dữ liệu.');
    }

    await this.questionService.update(question, {
      count_view: _question.count_view + 1,
    });

    return _question;
  }

  @Post()
  @UseGuards(AuthGuard('jwt-access'))
  async createQuestion(@Req() req, @Body() body: CreateQuestionDto) {
    const jwtPayload: IAccessJwtPayload = req.user;

    await this.questionService.create({
      title: body.title,
      body: body.body,
      tags: body.tags,
      // category: body.category,
      files: body.files,
      created_by: { _id: jwtPayload._id },
    });
  }

  @Patch('closed/:question')
  @UseGuards(AuthGuard('jwt-access'))
  async updateClosed(
    @Req() req,
    @Body() body: UpdateQuestionClosedDto,
    @Param('question') question: string,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _question = await this.questionService.findOne({
      where: { _id: question },
      relations: { created_by: true },
    });

    if (!Boolean(_question)) {
      throw new NotFoundException('Dữ liệu không tồn tại.');
    }

    if (
      !(_question.created_by._id === jwtPayload._id) &&
      !jwtPayload.role.owner
    ) {
      throw new ForbiddenException('Bạn không có quyền thao tác');
    }

    await this.questionService.update(question, { closed: body.closed });
  }

  @Patch(':question/vote-up')
  @UseGuards(AuthGuard('jwt-access'))
  async upVote(@Req() req, @Param('question') question: string) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _question = await this.questionService.findOne({
      where: { _id: question },
    });

    if (!Boolean(_question)) {
      throw new BadRequestException('Dữ liệu không tồn tại');
    }

    const { member_down_vote, member_up_vote } = _question;

    if (member_up_vote.includes(jwtPayload._id)) {
      await this.questionService.update(question, {
        member_up_vote: member_up_vote.filter((v) => v !== jwtPayload._id),
        member_down_vote: member_down_vote.filter((v) => v !== jwtPayload._id),
      });
    } else {
      await this.questionService.update(question, {
        member_up_vote: [...member_up_vote, jwtPayload._id],
        member_down_vote: member_down_vote.filter((v) => v !== jwtPayload._id),
      });
    }
  }

  @Patch(':question/vote-down')
  @UseGuards(AuthGuard('jwt-access'))
  async downVote(@Req() req, @Param('question') question: string) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _question = await this.questionService.findOne({
      where: { _id: question },
    });

    if (!Boolean(_question)) {
      throw new BadRequestException('Bài viết không tồn tại');
    }

    const { member_down_vote, member_up_vote } = _question;

    if (member_down_vote.includes(jwtPayload._id)) {
      await this.questionService.update(_question._id, {
        member_up_vote: member_up_vote.filter((v) => v !== jwtPayload._id),
        member_down_vote: member_down_vote.filter((v) => v !== jwtPayload._id),
      });
    } else {
      await this.questionService.update(_question._id, {
        member_up_vote: member_up_vote.filter((v) => v !== jwtPayload._id),
        member_down_vote: [...member_down_vote, jwtPayload._id],
      });
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt-access'))
  async removeQuestion(@Req() req, @Param('id') id: string) {
    const jwtPayload: IAccessJwtPayload = req.user;
    const _question = await this.questionService.findOne({
      where: { _id: id },
      relations: {
        created_by: true,
      },
    });

    if (!Boolean(_question)) {
      throw new BadRequestException('Dữ liệu không tồn tại.');
    }

    if (_question.created_by._id !== jwtPayload._id && !jwtPayload.role.owner) {
      throw new ForbiddenException('Bạn không có quyền thao tác.');
    }

    await this.questionService.delete(id);
  }
}
