import { checkIsNumber } from '@/shared/utils/global-func';
import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QAService } from './QA.service';
import { AuthGuard } from '@nestjs/passport';
import { IAccessJwtPayload } from '@/shared/types';

@Controller('Q&A')
@ApiTags('Q&A')
export class QAController {
  constructor(private readonly qaService: QAService) {}
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
  async createQuestion() {}

  @Post('answer')
  async createAnswer() {}

  @Delete('by-question/:question')
  async removeQuestion() {}

  @Delete('by-answer/:answer')
  async removeAnswer() {}
}