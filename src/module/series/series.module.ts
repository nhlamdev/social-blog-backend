import { Module, forwardRef } from '@nestjs/common';
import { SeriesController } from './series.controller';
import { SeriesService } from './series.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentModule } from '../content/content.module';
import { JwtAccessStrategy } from '@/auth/strategies';
import { TokenModule } from '@/auth/token/token.module';
import { MemberModule } from '../member/member.module';
import { SeriesEntity } from './series.entity';

@Module({
  imports: [
    forwardRef(() => ContentModule),
    forwardRef(() => TokenModule),
    forwardRef(() => MemberModule),
    TypeOrmModule.forFeature([SeriesEntity]),
  ],
  controllers: [SeriesController],
  providers: [SeriesService, JwtAccessStrategy],
  exports: [SeriesService, TypeOrmModule.forFeature([SeriesEntity])],
})
export class SeriesModule {}
