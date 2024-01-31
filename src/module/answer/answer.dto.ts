import { BaseDTO } from '@/shared/base';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnswerDto extends BaseDTO {
  @ApiProperty({ type: String })
  content: string;

  @ApiProperty({ type: [String] })
  files: string[];
}
