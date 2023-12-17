import { BaseDTO } from '@/base';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';
export class SeriesDto extends BaseDTO {
  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'Bạn chưa nhập tiêu đề!.' })
  @IsString({ message: 'Tiêu đề sai kiểu dữ liệu!' })
  @Length(10, 50, {
    message: 'Độ dài tiêu đề phải ít nhất 10 hoặc hoặc nhiều nhất 50 ký tự.',
  })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  title: string;

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'Bạn chưa nhập mô tả!.' })
  @IsString({ message: 'Mô tả sai kiểu dữ liệu!' })
  @Length(10, 200, {
    message: 'Độ dài mô tả phải ít nhất 10 hoặc hoặc nhiều nhất 200 ký tự.',
  })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  summary: string;
}
