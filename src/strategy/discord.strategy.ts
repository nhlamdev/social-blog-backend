import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-discord';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor() {
    super({
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: `${process.env.GLOBAL_DOMAIN}/service/discord/callback`,
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
