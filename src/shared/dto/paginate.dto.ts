import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { BaseDTO } from '../base';
import { checkIsNumber } from '../utils/global-func';

export class PaginationDto extends BaseDTO {
  @ApiProperty({
    type: String,
    format: 'number',
    default: 0,
    required: false,
    minimum: 0,
  })
  @Transform(({ value }: TransformFnParams) => {
    console.log(
      'transform : ',
      value,
      checkIsNumber(value?.trim()) ? Number(value?.trim()) : undefined,
    );
    return checkIsNumber(value?.trim()) ? Number(value?.trim()) : undefined;
  })
  take?: number;

  @ApiProperty({
    type: String,
    format: 'number',
    required: false,
    minimum: 0,
  })
  @Transform(({ value }: TransformFnParams) => {
    return checkIsNumber(value?.trim()) ? Number(value?.trim()) : undefined;
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
  search?: string;
}
