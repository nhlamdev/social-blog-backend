import { CommentEntity, ContentEntity, MemberEntity } from '@/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
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

    // if (payload.content) {
    //   newComment.content = payload.content;

    //   const queuePayload: IQueueContentNotify = {
    //     from: payload.member._id,
    //     to: payload.content.created_by._id,
    //     title: 'trả lời bình luận',
    //     content: payload.content._id,
    //     type: 'create-reply',
    //   };

    //   this.queueNotify.add('notify-action', queuePayload, {
    //     attempts: 3,
    //     backoff: 3000,
    //     removeOnComplete: true,
    //     removeOnFail: true,
    //   });
    // }

    // if (payload.parent) {
    //   newComment.comment_parent = payload.parent;

    //   // const queuePayload: IQueueContentNotify = {
    //   //   from: payload.member._id,
    //   //   to: payload.parent._id,
    //   //   title: 'trả lời bình luận',
    //   //   content: null,
    //   //   type: 'create-reply',
    //   // };

    //   // this.queueNotify.add('notify-action', queuePayload, {
    //   //   attempts: 3,
    //   //   backoff: 3000,
    //   //   removeOnComplete: true,
    //   //   removeOnFail: true,
    //   // });
    // }

    return await this.commentRepository.save(newComment);
  }

  async removeComment(comment: CommentEntity) {
    return await this.commentRepository.remove(comment);
  }
}
