import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseDTO } from '../base';
import { Transform, TransformFnParams } from 'class-transformer';
import { checkIsNumber } from '../utils/global-func';

export class PaginationDto extends BaseDTO {
  @ApiProperty({ type: String, format: 'number' })
  @IsNotEmpty({ message: 'Bạn chưa nhập tiêu đề!.' })
  @IsString({ message: 'Tiêu đề sai kiểu dữ liệu!' })
  @Transform(({ value }: TransformFnParams) => {
    return checkIsNumber(value?.trim()) ? Number(value?.trim()) : undefined;
  })
  take?: number;

  @ApiProperty({ type: String, format: 'number' })
  @IsNotEmpty({ message: 'Bạn chưa nhập tiêu đề!.' })
  @IsString({ message: 'Tiêu đề sai kiểu dữ liệu!' })
  @Transform(({ value }: TransformFnParams) => {
    return checkIsNumber(value?.trim()) ? Number(value?.trim()) : undefined;
  })
  skip?: number;

  @ApiPropertyOptional({ type: String })
  @IsNotEmpty({ message: 'Bạn chưa nhập tiêu đề!.' })
  @IsString({ message: 'Tiêu đề sai kiểu dữ liệu!' })
  @Transform(({ value }: TransformFnParams) => {
    const transform = value
      ? `%${value
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')}%`
      : '%%';

    return transform;
  })
  search?: string;
}
