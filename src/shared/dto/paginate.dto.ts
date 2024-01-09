import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseDTO } from '../base';
import { Transform, TransformFnParams } from 'class-transformer';

export class CategoryDto extends BaseDTO {
  @ApiProperty({ type: String, format: 'number' })
  @IsNotEmpty({ message: 'Bạn chưa nhập tiêu đề!.' })
  @IsString({ message: 'Tiêu đề sai kiểu dữ liệu!' })
  @Transform(({ value }: TransformFnParams) => Number(value?.trim()))
  take: number;

  @ApiProperty({ type: String, format: 'number' })
  @IsNotEmpty({ message: 'Bạn chưa nhập tiêu đề!.' })
  @IsString({ message: 'Tiêu đề sai kiểu dữ liệu!' })
  @Transform(({ value }: TransformFnParams) => Number(value?.trim()))
  skip: number;

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'Bạn chưa nhập tiêu đề!.' })
  @IsString({ message: 'Tiêu đề sai kiểu dữ liệu!' })
  @Transform(({ value }: TransformFnParams) => Number(value?.trim()))
  search: number;
}
