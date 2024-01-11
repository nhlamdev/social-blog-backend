import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { BaseDTO } from '../base';
import { checkIsNumber } from '../utils/global-func';
import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class PaginationDto extends BaseDTO {
  @IsOptional()
  @ApiProperty({ type: String, format: 'number', required: false })
  @IsNotEmpty()
  @Min(0)
  @Transform(({ value }: TransformFnParams) => {
    const transform = checkIsNumber(value?.trim())
      ? Number(value?.trim())
      : undefined;
    return transform;
  })
  take?: number;

  @IsOptional()
  @ApiProperty({ type: String, format: 'number', required: false })
  @IsNumber()
  @Min(1)
  @Transform(({ value }: TransformFnParams) => {
    const transform = checkIsNumber(value?.trim())
      ? Number(value?.trim())
      : value;

    console.log(transform);
    return transform;
  })
  skip?: number;

  @ApiProperty({ type: String, required: false })
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
  search: string;
}
