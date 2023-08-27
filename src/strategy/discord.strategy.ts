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
    // Here, you can save the user profile data to your database or perform any custom logic
    // The 'profile' parameter contains user information retrieved from Discord
    // You can access properties like profile.id, profile.username, profile.email, etc.

    // Example: const user = await this.authService.findOrCreateUser(profile);
    // Replace `findOrCreateUser` with your logic to manage user data

    return profile;
  }
}
