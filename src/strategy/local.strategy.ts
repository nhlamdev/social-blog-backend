import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  // private userService: CommonService
  constructor() {
    super({
      usernameField: 'account',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string): Promise<any> {
    // const user = await this.userService.validate(username, password);

    // return user;
    return false;
  }
}
