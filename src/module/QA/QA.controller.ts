import { Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('Q&A')
@ApiTags('Q&A')
export class QAController {
  @Get('questions')
  async questions() {}

  @Get('by-id/:question')
  async question() {}

  @Get('answers/:question')
  async answers() {}

  @Post('question')
  async createQuestion() {}

  @Post('answer')
  async createAnswer() {}

  @Delete('by-question/:question')
  async removeQuestion() {}

  @Delete('by-answer/:answer')
  async removeAnswer() {}
}
