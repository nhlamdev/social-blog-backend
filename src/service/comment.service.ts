import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity, ContentEntity, MemberEntity } from '@/entities';
import { Repository } from 'typeorm';
@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
  ) {}

  async commentByContent(content: ContentEntity) {
    return await this.commentRepository.find({
      where: { content: { _id: content._id } },
      relations: { create_by: true },
    });
  }

  async commentByParent(parent: CommentEntity) {
    return await this.commentRepository.find({
      where: { comment_parent: { _id: parent._id } },
      relations: { create_by: true },
    });
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
      newComment.create_by = payload.member;
    }

    if (payload.content) {
      newComment.content = payload.content;
    }

    if (payload.parent) {
      newComment.comment_parent = payload.parent;
    }

    return await this.commentRepository.save(newComment);
  }

  async removeComment(id: string) {
    return await this.commentRepository.delete(id);
  }
}
