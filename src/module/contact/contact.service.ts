import { Injectable } from '@nestjs/common';
import { contactRepository } from './contact.repository';

@Injectable()
export class ContactService extends contactRepository {}
