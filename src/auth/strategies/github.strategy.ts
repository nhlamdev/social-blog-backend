import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow('social.githubClientId'),
      clientSecret: configService.getOrThrow('social.githubClientSecret'),
      callbackURL: `${configService.getOrThrow(
        'app.frontendDomain',
      )}/service/github/callback`,
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const user = {
      provider: 'github',
      id: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      image: profile.photos[0].value,
    };

    return user;
  }
}
