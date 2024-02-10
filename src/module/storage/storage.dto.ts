import { BaseDTO } from '@/shared/base';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UploadFileDto extends BaseDTO {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  cluster: string;
}

export class UploadFilesDto extends BaseDTO {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  files: any;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  cluster: string;
}
