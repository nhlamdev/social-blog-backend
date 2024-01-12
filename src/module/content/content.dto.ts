import { BaseDTO } from '@/shared/base';
import { PaginationDto } from '@/shared/dto/paginate.dto';
import { toBooleanTransformer } from '@/shared/utils/transformers/to-boolean.transformer';
import { trimTransformer } from '@/shared/utils/transformers/trim.transformer';
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
  IsBoolean,
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

export class ContentFindPrivateDTO extends PaginationDto {
  @ApiProperty({ type: String })
  category: string;

  @ApiProperty({ type: String })
  series: string;

  @ApiProperty({ type: String })
  sortCase: string;
}

export class ContentFindPublicDTO extends ContentFindPrivateDTO {
  @ApiProperty({ type: String })
  tag: string;

  @ApiProperty({ type: String })
  author: string;
}

export class ContentsByCategoryDto extends PaginationDto {
  @ApiProperty({ type: String, format: 'boolean' })
  @IsNotEmpty()
  @IsBoolean()
  @Transform(trimTransformer)
  @Transform(toBooleanTransformer)
  isOutSide: boolean;
}

export class SeriesByCategoryDto extends PaginationDto {
  @ApiProperty({ type: String, format: 'boolean' })
  @IsNotEmpty()
  @Transform(trimTransformer)
  @Transform(toBooleanTransformer)
  @IsBoolean()
  isOutSide: boolean;
}
