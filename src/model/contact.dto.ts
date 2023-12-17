import { BaseDTO } from '@/base';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class CommentCreteDto extends BaseDTO {
  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'Bạn chưa nhập tiêu đề.' })
  @IsString({ message: 'Tiêu đề sai kiểu dữ liệu!.' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  title: string;

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'Bạn chưa nhập nội dung.' })
  @IsString({ message: 'Nội dung sai kiểu dữ liệu!.' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  descriptions: string;
}
