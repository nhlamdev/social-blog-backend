import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { BaseDTO } from '../base';
import { checkIsNumber } from '../utils/global-func';
import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { searchFormatTransformer } from '../utils/transformers/serach-format.tranformer';
import { trimTransformer } from '../utils/transformers/trim.transformer';
import { MaybeType } from '../utils/types/maybe.type';

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
  take?: MaybeType<number>;

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
  skip?: MaybeType<number>;

  @IsOptional()
  @ApiProperty({ type: String, required: false })
  @Transform(trimTransformer)
  @Transform(searchFormatTransformer)
  search?: MaybeType<string>;
}
