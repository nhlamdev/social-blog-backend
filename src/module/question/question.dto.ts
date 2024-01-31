import { BaseDTO } from '@/shared/base';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto extends BaseDTO {
  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty({ type: String })
  category: string;

  @ApiProperty({ type: String })
  body: string;

  @ApiProperty({ type: [String] })
  files: string[];
}

export class UpdateQuestionClosedDto extends BaseDTO {
  @ApiProperty({ type: Boolean })
  closed: boolean;
}
