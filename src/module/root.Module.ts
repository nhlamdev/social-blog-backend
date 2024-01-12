import { Module } from '@nestjs/common';
import { ContactModule } from './contact/contact.module';
import { MemberModule } from './member/member.module';
import { ContentModule } from './content/content.module';
import { CategoryModule } from './category/category.module';
import { SeriesModule } from './series/series.module';
import { CommentModule } from './comment/comment.module';
import { NotificationModule } from './notification/notification.module';
import { FileModule } from './file/file.module';
import { SessionModule } from './session/session.module';

const modules = [
  MemberModule,
  SessionModule,
  ContactModule,
  ContentModule,
  CategoryModule,
  SeriesModule,
  CommentModule,
  NotificationModule,
  FileModule,
];

@Module({ imports: modules, exports: modules })
export class RootModule {}
