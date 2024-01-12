import { TokenModule } from '@/auth/token/token.module';
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentModule } from '../content/content.module';
import { MemberModule } from '../member/member.module';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { ContactEntity } from './contact.entity';

@Module({
  imports: [
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
