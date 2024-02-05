import { IAccessJwtPayload } from '@/shared/types';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { AnswerService } from './answer.service';
import { QuestionService } from '../question/question.service';
import { CreateAnswerDto } from './answer.dto';

@Controller('answer')
@ApiTags('answer')
export class AnswerController {
  constructor(
    private readonly answerService: AnswerService,
    private readonly questionService: QuestionService,
  ) {}

  @Get('by-question/:question')
  async getByQuestion(@Param('question') question: string) {
    const [answers, count] = await this.answerService.repository.findAndCount({
      where: { question: { _id: question } },
      relations: {
        question: true,
        created_by: true,
      },
    });

    return { count, answers };
  }

  @Get('by-parent/:parent')
  @UseGuards(AuthGuard('jwt-access'))
  async getByParent(@Param('parent') parent: string) {
    const [answers, count] = await this.answerService.repository.findAndCount({
      where: { answer_parent: { _id: parent } },
      relations: {
        answer_parent: true,
        created_by: true,
      },
    });

    return { count, answers };
  }

  @Post('by-question/:question')
  @UseGuards(AuthGuard('jwt-access'))
  async postByQuestion(
    @Req() req,
    @Body() body: any,
    @Param('question') question: string,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _question = await this.questionService.repository.findOne({
      where: {
        _id: question,
        created_by: { _id: jwtPayload._id },
      },
      relations: { created_by: true },
    });

    if (!Boolean(_question)) {
      throw new BadRequestException('Câu hỏi không tồn tại');
    }

    await this.answerService.repository.save({
      content: body.content,
      files: body.files,
      question: _question,
      created_by: { _id: jwtPayload._id },
    });
  }

  @Post('by-parent/:parent')
  async postByParent(
    @Req() req,
    @Body() body: CreateAnswerDto,
    @Param('parent') parent: string,
  ) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _parent = await this.answerService.repository.findOne({
      where: {
        _id: parent,
        created_by: { _id: jwtPayload._id },
      },
      relations: { created_by: true, question: true },
    });

    if (!Boolean(_parent)) {
      throw new BadRequestException('Câu hỏi không tồn tại');
    }

    await this.answerService.repository.save({
      content: body.content,
      files: body.files,
      answer_parent: _parent,
      question: _parent.question,
      created_by: { _id: jwtPayload._id },
    });
  }

  @Patch(':answer/vote-up')
  @UseGuards(AuthGuard('jwt-access'))
  async upVote(@Req() req, @Param('answer') answer: string) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _answer = await this.answerService.repository.findOne({
      where: { _id: answer },
    });

    if (!Boolean(_answer)) {
      throw new BadRequestException('Dữ liệu không tồn tại');
    }

    const { member_down_vote, member_up_vote } = _answer;

    if (member_up_vote.includes(jwtPayload._id)) {
      await this.answerService.repository.update(answer, {
        member_up_vote: member_up_vote.filter((v) => v !== jwtPayload._id),
        member_down_vote: member_down_vote.filter((v) => v !== jwtPayload._id),
      });
    } else {
      await this.answerService.repository.update(answer, {
        member_up_vote: [...member_up_vote, jwtPayload._id],
        member_down_vote: member_down_vote.filter((v) => v !== jwtPayload._id),
      });
    }
  }

  @Patch(':answer/vote-down')
  @UseGuards(AuthGuard('jwt-access'))
  async downVote(@Req() req, @Param('answer') answer: string) {
    const jwtPayload: IAccessJwtPayload = req.user;

    const _answer = await this.answerService.repository.findOne({
      where: { _id: answer },
    });

    if (!Boolean(_answer)) {
      throw new BadRequestException('Bài viết không tồn tại');
    }

    const { member_down_vote, member_up_vote } = _answer;

    if (member_down_vote.includes(jwtPayload._id)) {
      await this.answerService.repository.update(_answer._id, {
        member_up_vote: member_up_vote.filter((v) => v !== jwtPayload._id),
        member_down_vote: member_down_vote.filter((v) => v !== jwtPayload._id),
      });
    } else {
      await this.answerService.repository.update(_answer._id, {
        member_up_vote: member_up_vote.filter((v) => v !== jwtPayload._id),
        member_down_vote: [...member_down_vote, jwtPayload._id],
      });
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt-access'))
  async removeQuestion(@Req() req, @Param('id') id: string) {
    const jwtPayload: IAccessJwtPayload = req.user;
    const _question = await this.answerService.repository.findOne({
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

    await this.answerService.repository.delete(id);
  }
}
