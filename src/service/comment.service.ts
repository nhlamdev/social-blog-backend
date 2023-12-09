import {
  CommentEntity,
  ContentEntity,
  MemberEntity,
  NotifyEntity,
} from '@/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommonService } from './common.service';
@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(NotifyEntity)
    private readonly notifyRepository: Repository<NotifyEntity>,
    @InjectRepository(MemberEntity)
    private readonly memberRepository: Repository<MemberEntity>,
    private readonly commonService: CommonService,
  ) {}

  async checkExistById(id: string) {
    return await this.commentRepository.exist({ where: { _id: id } });
  }

  async commentById(id: string) {
    return await this.commentRepository.findOne({
      where: { _id: id },
      relations: { created_by: true },
    });
  }

  async countCommentByContent(content: ContentEntity) {
    return await this.commentRepository.count({
      where: { content: { _id: content._id } },
    });
  }

  async commentByContent(content: ContentEntity, _take: number, _skip: number) {
    const comments = await this.commentRepository.find({
      where: { content: { _id: content._id } },
      relations: { created_by: true },
      skip: _skip,
      take: _take,
      order: { created_at: 'DESC' },
    });

    const commentsWidthCountReply = await comments.map(async (comment) => {
      const count = this.commentRepository.count({
        where: { comment_parent: { _id: comment._id } },
      });

      const commentWithCountReply = { ...comment, reply: await count };

      return commentWithCountReply;
    });

    const result = {
      data: await Promise.all(commentsWidthCountReply),
      max: await this.countCommentByContent(content),
    };

    return result;
  }

  async commentByParent(parent: CommentEntity, _take: number, _skip: number) {
    const data = await this.commentRepository.find({
      where: { comment_parent: { _id: parent._id } },
      relations: { created_by: true },
      skip: _skip,
      take: _take,
      order: { created_at: 'DESC' },
    });

    const count = await this.commentRepository.count({
      where: { comment_parent: { _id: parent._id } },
    });

    const result = {
      data: data,
      max: count,
    };

    return result;
  }

  async createComment(payload: {
    text: string;
    content?: ContentEntity;
    member?: MemberEntity;
    parent?: CommentEntity;
  }) {
    const newComment = new CommentEntity();

    newComment.text = payload.text;

    if (payload.member) {
      newComment.created_by = payload.member;
    }

    if (payload.content) {
      newComment.content = payload.content;

      const notifyPayload: {
        title: string;
        description?: string;
        from: string;
        to: string;
        url?: string;
      } = {
        from: payload.member._id,
        to: payload.content.created_by._id,
        title: 'bình luận',
        url: `/content/${payload.content._id}`,
      };

      this.commonService.saveNotify(notifyPayload);
    }

    if (payload.parent) {
      newComment.comment_parent = payload.parent;

      const notifyPayload: {
        title: string;
        description?: string;
        from: string;
        to: string;
        url?: string;
      } = {
        from: payload.member._id,
        to: payload.parent._id,
        title: 'trả lời bình luận',
        url: `/content/${payload.parent.content._id}`,
      };

      this.commonService.saveNotify(notifyPayload);
    }

    return await this.commentRepository.save(newComment);
  }

  async removeComment(comment: CommentEntity) {
    return await this.commentRepository.remove(comment);
  }
}
