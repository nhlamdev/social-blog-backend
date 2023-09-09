import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CommentCreteDto {
  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'Bạn chưa nhập bình luân.' })
  @IsString({ message: 'Bình luận sai kiểu dữ liệu!.' })
  text: string;
}
