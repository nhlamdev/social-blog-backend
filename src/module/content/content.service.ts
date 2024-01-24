import { Injectable } from '@nestjs/common';
import { contentRepository } from './content.repository';

@Injectable()
export class ContentService extends contentRepository {}
