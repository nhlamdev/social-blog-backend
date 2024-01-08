import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-discord';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow('social.discordClientId'),
      clientSecret: configService.getOrThrow('social.discordClientSecret'),
      callbackURL: `${configService.getOrThrow(
        'app.frontendDomain',
      )}/service/discord/callback`,
      scope: ['identify', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const user = {
      provider: 'discord',
      id: profile.id,
      name: profile.global_name,
      email: profile.email,
      image: profile.avatar,
    };

    return user;
  }
}
