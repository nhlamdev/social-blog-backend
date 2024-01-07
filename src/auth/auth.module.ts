import { RedisModule } from '@/helper/cache/redis.module';
import { MemberModule } from '@/module/member/member.module';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import * as controllers from './controller';
import * as services from './services';

const authServices = Object.entries(services).map((v) => v[1]);
const authControllers = Object.entries(controllers).map((v) => v[1]);

@Module({
  imports: [
    RedisModule,
    ConfigModule,
    JwtModule.register({}),
    forwardRef(() => MemberModule),
  ],
  controllers: [...authControllers],
  providers: [...authServices],
  exports: [...authServices],
})
export class AuthModule {}
