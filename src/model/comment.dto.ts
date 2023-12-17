import { BaseDTO } from '@/base';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CommentCreteDto extends BaseDTO {
  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'Bạn chưa nhập bình luân.' })
  @IsString({ message: 'Bình luận sai kiểu dữ liệu!.' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  text: string;
}
