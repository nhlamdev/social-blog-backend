import { Injectable } from '@nestjs/common';
import { SessionRepository } from './session.repository';

@Injectable()
export class SessionService extends SessionRepository {}
