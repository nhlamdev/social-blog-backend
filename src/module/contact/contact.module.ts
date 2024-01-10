import { TokenModule } from '@/auth/token/token.module';
import { ContactEntity } from '@/database/entities';
import { RedisModule } from '@/helper/cache/redis.module';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentModule } from '../content/content.module';
import { MemberModule } from '../member/member.module';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  imports: [
    RedisModule,
    forwardRef(() => ContentModule),
    forwardRef(() => TokenModule),
    forwardRef(() => MemberModule),
    TypeOrmModule.forFeature([ContactEntity]),
  ],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService, TypeOrmModule.forFeature([ContactEntity])],
})
export class ContactModule {}
