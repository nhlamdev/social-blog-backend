import validateConfig from '@/utils/validate-config';
import { registerAs } from '@nestjs/config';
import { SocialEnvironmentVariablesValidator } from './validator/social.vaidator';
import { TypeSocialConfig } from './types/social.type';

export const socialConfig = registerAs<TypeSocialConfig>('social', () => {
  validateConfig(process.env, SocialEnvironmentVariablesValidator);

  return {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    discordClientId: process.env.DISCORD_CLIENT_ID,
    discordClientSecret: process.env.DISCORD_CLIENT_SECRET,
  };
});
