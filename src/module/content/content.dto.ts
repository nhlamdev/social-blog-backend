import { BaseDTO } from '@/shared/base';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
} from 'class-validator';

export class ContentDto extends BaseDTO {
  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'Bạn chưa nhập tiêu đề!.' })
  @IsString({ message: 'Tiêu đề sai kiểu dữ liệu!.' })
  @Length(10, 200, {
    message: 'Độ dài tiêu đề phải ít nhất 10 hoặc hoặc nhiều nhất 200 ký tự!.',
  })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  title: string;

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'Bạn chưa nhập nội dung!.' })
  @IsString({ message: 'Nội dung sai kiểu dữ liệu!.' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  body: string;

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'Bạn chưa nhập thể loại!.' })
  @IsString({ message: 'Thể loại sai kiểu dữ liệu!.' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  category: string;

  @ApiProperty({ type: [String] })
  @IsArray({ message: 'Danh sách thẻ sai kiểu dữ liệu!.' })
  @IsNotEmpty({ message: 'Bạn chưa nhập danh sách thẻ!.' })
  @ArrayMinSize(0, { message: 'Phải gắn ít nhất 1 thẻ!.' })
  @ArrayMaxSize(3, { message: 'Nhiều nhất chỉ được 3 thẻ!.' })
  tags: string[];

  @ApiProperty({ type: String })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  series?: string;

  @ApiProperty({ type: Boolean })
  @IsOptional()
  public?: boolean;

  @ApiProperty({ type: Boolean })
  @IsOptional()
  complete?: boolean;
}
