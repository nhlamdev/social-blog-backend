import { MemberService } from '@/auth/service';
import * as config from '@/config';
import { DbConnectModule } from '@/database/database.module';
import * as entities from '@/database/entities';
import * as middleware from '@/middleware';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import {
  Inject,
  MiddlewareConsumer,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { Cache } from 'cache-manager';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: Object.entries(config).map((v) => v[1]),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
        },
      }),
      inject: [ConfigService],
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/',
    }),
    ScheduleModule.forRoot(),
    DbConnectModule,
    SharedModule,
    AuthModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly memberService: MemberService,
  ) {
    this.cacheManager.reset();
  }
  configure(consumer: MiddlewareConsumer) {
    Object.entries(middleware).forEach((v) => {
      consumer.apply(v[1]).forRoutes('*');
    });
  }
  async onModuleInit() {
    console.log('reset cache members.');
    console.log('reset cache members done.');

    console.log('start initialized cache members.');
    const members = await this.memberService.allMembers();

    const membersCache: { [key: string]: entities.MemberEntity } = {};

    for (const member of members) {
      membersCache[member._id] = member;
    }

    await this.cacheManager.set('members', membersCache, 0);
    console.log('initialized cache members done.');
  }
}
