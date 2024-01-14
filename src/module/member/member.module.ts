import { TokenModule } from '@/auth/token/token.module';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { MemberEntity } from './member.entity';
import { SeriesModule } from '../series/series.module';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberEntity]),
    forwardRef(() => TokenModule),
    forwardRef(() => SeriesModule),
    forwardRef(() => ContentModule),
  ],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService, TypeOrmModule.forFeature([MemberEntity])],
})
export class MemberModule {}
