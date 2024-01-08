import { Module, forwardRef } from '@nestjs/common';
import { SeriesController } from './series.controller';
import { SeriesService } from './series.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeriesEntity } from '@/database/entities';
import { RedisModule } from '@/helper/cache/redis.module';
import { ContentModule } from '../content/content.module';
import { JwtAccessStrategy } from '@/auth/strategies';
import { TokenModule } from '@/auth/token/token.module';

@Module({
  imports: [
    RedisModule,
    forwardRef(() => ContentModule),
    forwardRef(() => TokenModule),
    TypeOrmModule.forFeature([SeriesEntity]),
  ],
  controllers: [SeriesController],
  providers: [SeriesService, JwtAccessStrategy],
  exports: [SeriesService, TypeOrmModule.forFeature([SeriesEntity])],
})
export class SeriesModule {}
