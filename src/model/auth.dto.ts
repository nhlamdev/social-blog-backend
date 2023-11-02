import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
export class ProfileDto {
  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'Bạn chưa nhập tiêu đề!.' })
  @IsString({ message: 'Tiêu đề sai kiểu dữ liệu!' })
  name: string;

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'Bạn chưa nhập mô tả!.' })
  @IsString({ message: 'Mô tả sai kiểu dữ liệu!' })
  iamge: string;
}
