import { RedisModule } from '@/helper/cache/redis.module';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberModule } from '../member/member.module';
import { SeriesEntity } from '../series/series.entity';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

@Module({
  imports: [
    RedisModule,
    TypeOrmModule.forFeature([SeriesEntity]),
    forwardRef(() => MemberModule),
  ],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService, TypeOrmModule.forFeature([SeriesEntity])],
})
export class SessionModule {}
