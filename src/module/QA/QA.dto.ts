import { BaseDTO } from '@/shared/base';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnswerDto extends BaseDTO {
  @ApiProperty({ type: String })
  body: string;

  @ApiProperty({ type: [String] })
  files: string[];
}

export class CreateQuestionDto extends CreateAnswerDto {
  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty({ type: String })
  category: string;
}

export class UpdateQuestionVerifyDto extends BaseDTO {
  @ApiProperty({ type: Boolean })
  verify: boolean;
}

export class UpdateQuestionClosedDto extends BaseDTO {
  @ApiProperty({ type: Boolean })
  closed: boolean;
}
