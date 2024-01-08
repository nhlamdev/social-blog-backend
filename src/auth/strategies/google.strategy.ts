import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow('social.googleClientId'),
      clientSecret: configService.getOrThrow('social.googleClientSecret'),
      callbackURL: `${configService.getOrThrow(
        'app.frontendDomain',
      )}/service/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { name, email, picture: image, sub: id } = profile._json;
    const user = { provider: 'google', id, name, email, image };

    return user;
  }
}
