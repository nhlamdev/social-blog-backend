import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

export class ContentDto {
  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'Bạn chưa nhập tiêu đề!.' })
  @IsString({ message: 'Tiêu đề sai kiểu dữ liệu!.' })
  @Length(10, 200, {
    message: 'Độ dài tiêu đề phải ít nhất 10 hoặc hoặc nhiều nhất 200 ký tự!.',
  })
  title: string;

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'Bạn chưa nhập nội dung!.' })
  @IsString({ message: 'Nội dung sai kiểu dữ liệu!.' })
  body: string;

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'Bạn chưa nhập thể loại!.' })
  @IsString({ message: 'Thể loại sai kiểu dữ liệu!.' })
  category: string;

  @ApiProperty({ type: [String] })
  @IsArray({ message: 'Danh sách thẻ sai kiểu dữ liệu!.' })
  @IsNotEmpty({ message: 'Bạn chưa nhập danh sách thẻ!.' })
  @ArrayMinSize(0, { message: 'Phải gắn ít nhất 1 thẻ!.' })
  @ArrayMaxSize(3, { message: 'Nhiều nhất chỉ được 3 thẻ!.' })
  tags: string[];

  @ApiProperty({ type: String })
  // @IsString({ message: 'Tiêu đề sai kiểu dữ liệu!.' })
  series?: string;

  @ApiProperty({ type: Boolean })
  // @IsString({ message: 'Tiêu đề sai kiểu dữ liệu!.' })
  public: boolean;

  @ApiProperty({ type: Boolean })
  // @IsString({ message: 'Tiêu đề sai kiểu dữ liệu!.' })
  complete: boolean;
}
