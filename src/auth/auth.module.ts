import { Module } from '@nestjs/common';
import * as services from './service';
import * as strategies from './strategies';
import { RedisModule } from '@/shared/cache/redis.module';

const serviceMapping = Object.entries(services).map((v) => v[1]);
const strategiesMapping = Object.entries(strategies).map((v) => v[1]);

@Module({
  imports: [RedisModule],
  providers: [...serviceMapping, ...strategiesMapping],
  exports: [...serviceMapping],
})
export class AuthModule {}
