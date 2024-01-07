import { BaseDTO } from '@/shared/base';
import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class MemberUpdateDto extends BaseDTO {
  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'Bạn chưa nhập tiêu đề!.' })
  @IsString({ message: 'Tiêu đề sai kiểu dữ liệu!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;

  @Optional()
  @ApiProperty({ type: String })
  image: string;
}

export class MemberUpdateRoleDto extends BaseDTO {
  @Transform(({ value }: TransformFnParams) => value?.trim())
  id: string;

  @Optional()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  author: boolean;

  @Optional()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  comment: boolean;
}
