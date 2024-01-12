import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SessionService } from './session.service';

@Controller('session')
@ApiTags('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}
}
