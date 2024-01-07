import { Module } from '@nestjs/common';
import { ContactModule } from './contact/contact.module';
import { MemberModule } from './member/member.module';
import { ContentModule } from './content/content.module';
import { CategoryModule } from './category/category.module';
import { SeriesModule } from './series/series.module';
import { CommentModule } from './comment/comment.module';

const modules = [
  MemberModule,
  ContactModule,
  ContentModule,
  CategoryModule,
  SeriesModule,
  CommentModule,
];

@Module({ imports: modules, exports: modules })
export class RootModule {}
