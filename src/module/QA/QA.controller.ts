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
import { ApiTags } from '@nestjs/swagger';
import { FileService } from '../file/file.service';
import {
  CreateAnswerDto,
  CreateQuestionDto,
  UpdateQuestionClosedDto,
  UpdateQuestionVerifyDto,
} from './QA.dto';
import { QAService } from './QA.service';

@Controller('Q&A')
@ApiTags('Q&A')
export class QAController {
  constructor(
    private readonly qaService: QAService,
    private readonly fileService: FileService,
  ) {}
  @Get('questions')
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

    const { result: questions, count } = await this.qaService.findAllAndCount({
      where: { title: _search, verify: true },
      take: _take,
      skip: _skip,
      relations: { files: true, created_by: true },
    });

    return { questions, count };
  }

  @Get('owner/questions')
  @UseGuards(AuthGuard('jwt-access'))
  async checkQuestions(
    @Req() req,
    @Query('skip') skip: string,
    @Query('take') take: string,
    @Query('search') search: string,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    if (!jwtPayload.role.owner) {
      throw new ForbiddenException('Bạn không có quyền hạn thao tác.');
    }

    const _take = checkIsNumber(take) ? Number(take) : undefined;
    const _skip = checkIsNumber(skip) ? Number(skip) : undefined;
    const _search = search
      ? `%${search
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    const { result: questions, count } = await this.qaService.findAllAndCount({
      where: { title: _search },
      take: _take,
      skip: _skip,
      relations: { files: true, created_by: true },
    });

    return { questions, count };
  }

  @Get('by-id/:question')
  async question(@Param('question') question: string) {
    const _question = await this.qaService.findOne({
      where: { _id: question },
    });

    await this.qaService.update(question, {
      count_view: _question.count_view + 1,
    });

    if (!_question) {
      throw new Error('Question not found');
    }
    return _question;
  }

  @Get('answers/:question')
  async answers(@Param('question') question: string) {
    const _question = await this.qaService.findOne({
      where: { _id: question },
    });

    if (!_question) {
      throw new Error('Question not found');
    }

    const { count, result: answers } = await this.qaService.findAllAndCount({
      where: { question: _question },
      relations: { question: true },
    });

    return { answers, count };
  }

  @Post('question')
  @UseGuards(AuthGuard('jwt-access'))
  async createQuestion(@Req() req, @Body() body: CreateQuestionDto) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const files = await Promise.all(
      body.files.map(async (file) => {
        const _file = await this.fileService.findOne({
          where: { _id: file, created_by: { _id: jwtPayload._id } },
        });

        if (!Boolean(file)) {
          throw new Error('Tệp tin có vấn đề!.');
        }

        return _file;
      }),
    );

    await this.qaService.create({
      title: body.title,
      body: body.body,
      tags: body.tags,
      category: body,
      files: files,
      created_by: { _id: jwtPayload._id },
    });
  }

  @Post('answer/:question')
  @UseGuards(AuthGuard('jwt-access'))
  async createAnswer(
    @Req() req,
    @Body() body: CreateAnswerDto,
    @Param('question') question: string,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const files = await Promise.all(
      body.files.map(async (file) => {
        const _file = await this.fileService.findOne({
          where: { _id: file, created_by: { _id: jwtPayload._id } },
        });

        if (!Boolean(file)) {
          throw new Error('Tệp tin có vấn đề');
        }

        return _file;
      }),
    );

    const _question = await this.qaService.findOne({
      where: {
        _id: question,
        created_by: { _id: jwtPayload._id },
      },
      relations: { created_by: true },
    });

    if (!Boolean(_question)) {
      throw new BadRequestException('Câu hỏi không tồn tại');
    }

    await this.qaService.create({
      body: body.body,
      files: files,
      verify: true,
      closed: false,
      question: _question,
      created_by: { _id: jwtPayload._id },
    });
  }

  @Patch('update-closed/:question')
  @UseGuards(AuthGuard('jwt-access'))
  async updateClosed(
    @Req() req,
    @Body() body: UpdateQuestionClosedDto,
    @Param('question') question: string,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _question = await this.qaService.findOne({
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

    await this.qaService.update(question, { closed: body.closed });
  }

  @Patch('update-verify/:question')
  @UseGuards(AuthGuard('jwt-access'))
  async updateVerify(
    @Req() req,
    @Body() body: UpdateQuestionVerifyDto,
    @Param('question') question: string,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _question = await this.qaService.findOne({
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

    await this.qaService.update(question, { closed: body.verify });
  }

  @Patch(':id/vote-up')
  @UseGuards(AuthGuard('jwt-access'))
  async upVote(@Req() req, @Param('id') id: string) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const qa = await this.qaService.findOne({
      where: { _id: id },
    });

    if (!Boolean(qa)) {
      throw new BadRequestException('Dữ liệu không tồn tại');
    }

    const { member_down_vote, member_up_vote } = qa;

    if (member_up_vote.includes(jwtPayload._id)) {
      await this.qaService.update(qa._id, {
        member_up_vote: member_up_vote.filter((v) => v !== jwtPayload._id),
        member_down_vote: member_down_vote.filter((v) => v !== jwtPayload._id),
      });
    } else {
      await this.qaService.update(qa._id, {
        member_up_vote: [...member_up_vote, jwtPayload._id],
        member_down_vote: member_down_vote.filter((v) => v !== jwtPayload._id),
      });
    }
  }

  @Patch(':id/vote-down')
  @UseGuards(AuthGuard('jwt-access'))
  async downVote(@Req() req, @Param('id') id: string) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const qa = await this.qaService.findOne({
      where: { _id: id },
    });

    if (!Boolean(qa)) {
      throw new BadRequestException('Bài viết không tồn tại');
    }

    const { member_down_vote, member_up_vote } = qa;

    if (member_down_vote.includes(jwtPayload._id)) {
      await this.qaService.update(qa._id, {
        member_up_vote: member_up_vote.filter((v) => v !== jwtPayload._id),
        member_down_vote: member_down_vote.filter((v) => v !== jwtPayload._id),
      });
    } else {
      await this.qaService.update(qa._id, {
        member_up_vote: member_up_vote.filter((v) => v !== jwtPayload._id),
        member_down_vote: [...member_down_vote, jwtPayload._id],
      });
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt-access'))
  async removeQuestion(@Req() req, @Param('id') id: string) {
    const jwtPayload: IAccessJwtPayload = req.user;
    const _question = await this.qaService.findOne({
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

    await this.qaService.delete(id);
  }
}
