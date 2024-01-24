import { Injectable } from '@nestjs/common';
import { commentRepository } from './comment.repository';

@Injectable()
export class CommentService extends commentRepository {}
