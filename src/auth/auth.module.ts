import { RedisModule } from '@/cache/redis.module';
import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import * as controllers from './controller';
import * as services from './services';
import { MemberModule } from '@/module';

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
