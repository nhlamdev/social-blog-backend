import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseDTO } from '@/shared/base';
import { Transform, TransformFnParams } from 'class-transformer';

export class ProfileDto extends BaseDTO {
  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'Bạn chưa nhập tiêu đề!.' })
  @IsString({ message: 'Tiêu đề sai kiểu dữ liệu!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name?: string;

  @ApiProperty({ type: String })
  image?: string;
}
