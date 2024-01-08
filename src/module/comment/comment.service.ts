import {
  CommentEntity,
  ContentEntity,
  MemberEntity,
} from '@/database/entities';
import { TypeTypeOrmCriteria } from '@/shared/utils/criteria-key.typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
  ) {}

  async findOne(options?: FindOneOptions<CommentEntity>) {
    return await this.commentRepository.findOne(options);
  }

  async findAll(options?: FindManyOptions<CommentEntity>) {
    return await this.commentRepository.find(options);
  }

  async findAllAndCount(options?: FindManyOptions<CommentEntity>) {
    return await this.commentRepository.findAndCount(options);
  }

  async exist(options?: FindManyOptions<CommentEntity>) {
    return this.commentRepository.exist(options);
  }

  async count(options?: FindManyOptions<CommentEntity>) {
    return this.commentRepository.count(options);
  }

  async create(payload: {
    text: string;
    member: MemberEntity;
    content?: ContentEntity;
    parent?: CommentEntity;
  }) {
    const comment = new CommentEntity();
    comment.text = payload.text;
    comment.created_by = payload.member;

    if (payload.parent) {
      comment.comment_parent = payload.parent;
    }

    if (payload.content) {
      comment.content = payload.content;
    }

    return await this.commentRepository.save(comment);
  }

  async update(
    criteria: TypeTypeOrmCriteria,
    payload: QueryDeepPartialEntity<CommentEntity>,
  ) {
    return await this.commentRepository.update(criteria, payload);
  }

  async delete(criteria: TypeTypeOrmCriteria) {
    return await this.commentRepository.delete(criteria);
  }

  async softDelete(criteria: TypeTypeOrmCriteria) {
    return await this.commentRepository.softDelete(criteria);
  }

  async builder() {
    return await this.commentRepository.createQueryBuilder('series');
  }
}
