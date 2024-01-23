import { BaseDTO } from '@/shared/base';
import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto extends BaseDTO {
  @ApiProperty({ type: String })
  isResize: string;
}
