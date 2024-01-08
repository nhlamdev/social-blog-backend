import {
  IAccessJwtPayload,
  IRefreshJwtPayload,
  IRefreshTokenCache,
} from '@/shared/types';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RedisClientType } from 'redis';
import { v4 as uuidV4 } from 'uuid';
import {
  IAccessTokenCreate,
  IRefreshTokenCreate,
} from '../../shared/types/token.type';

@Injectable({})
export class TokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
  ) {}
  async createRefreshToken(payload: IRefreshTokenCreate) {
    const { client, member_id, social_payload } = payload;

    const randomId = uuidV4();

    const name: string = this.configService.getOrThrow(
      'auth.refreshSecretName',
    );
    const secret: string = this.configService.getOrThrow('auth.refreshSecret');
    const expires: number = this.configService.getOrThrow(
      'auth.refreshExpires',
    );

    const device = client.device ? client.device : 'unknown';
    const ip = client.ip ? client.ip : 'unknown';
    const browser = client.browser
      ? `${client.browser.name} ${client.browser.version}`
      : 'unknown';
    const os = client.os ? `${client.os.name} ${client.os.version}` : 'unknown';

    const newTokenCache: IRefreshTokenCache = {
      token_key: randomId,
      provider_id: social_payload.id,
      provider: social_payload.provider,
      os,
      device,
      browser,
      ip,
      member_id,
      create_at: new Date().getTime().toString(),
    };

    const newToken: IRefreshJwtPayload = {
      key: randomId,
      member_id: member_id,
    };

    const keys = Object.keys(newTokenCache);

    for (const key of keys) {
      await this.redisClient.HSET(
        `token-${member_id}-${randomId}`,
        key,
        newTokenCache[key],
      );
    }

    await this.redisClient.EXPIRE(`token-${member_id}-${randomId}`, expires);

    const token = await this.jwtService.sign(newToken, { secret });

    return { name, expires, token };
  }

  async createAccessToken(payload: IAccessTokenCreate) {
    const { member, token_refresh_id } = payload;
    const name: string = this.configService.getOrThrow('auth.secretName');
    const secret: string = this.configService.getOrThrow('auth.secret');
    const expires: number = this.configService.getOrThrow('auth.expires');

    const newToken: IAccessJwtPayload = {
      _id: member._id,
      name: member.name,
      email: member.email,
      image: member.image,
      expired: expires,
      refresh_token: token_refresh_id,
      created_at: member.created_at,
      token_created_at: new Date(),
      role: {
        owner: member.role_owner,
        comment: member.role_comment,
        author: member.role_author,
      },
    };

    const token = await this.jwtService.sign(newToken, {
      secret,
      expiresIn: expires,
    });

    return { name, expires, token };
  }

  async verifyRefreshToken(token: string) {
    const secret: string = this.configService.getOrThrow('auth.refreshSecret');
    const tokenVerify: IRefreshJwtPayload = await this.jwtService.verifyAsync(
      token,
      {
        secret,
      },
    );

    return tokenVerify;
  }

  async checkExistTokenInCache(payload: { key: string; member_id: string }) {
    const { key, member_id } = payload;

    const exist = await this.redisClient.EXISTS(`token-${member_id}-${key}`);
    return Boolean(exist);
  }

  async allTokenStatus() {
    const keys = await this.redisClient.KEYS('token-*');

    const tokens = await Promise.all(
      keys.map(async (key) => {
        const value = await this.redisClient.HGETALL(key);
        return value as any;
      }),
    );

    return tokens as IRefreshTokenCache[];
  }

  async tokenStatusByMember(member_id: string) {
    const keys = await this.redisClient.KEYS(`*${member_id}*`);

    const tokens = await Promise.all(
      keys.map(async (key) => {
        const value = await this.redisClient.HGETALL(key);
        return value as any;
      }),
    );

    return tokens as IRefreshTokenCache[];
  }

  async tokenStatusByKey(key: string) {
    const keys = await this.redisClient.KEYS(`*${key}`);

    const tokens = await Promise.all(
      keys.map(async (key) => {
        const value = await this.redisClient.HGETALL(key);
        return value as any;
      }),
    );

    return tokens as IRefreshTokenCache[];
  }

  async tokenStatusByKeyAndMember(member_id: string, key: string) {
    const keys = await this.redisClient.KEYS(`*${member_id}-${key}`);

    const tokens = await Promise.all(
      keys.map(async (key) => {
        const value = await this.redisClient.HGETALL(key);
        return value as any;
      }),
    );

    return tokens as IRefreshTokenCache[];
  }

  async removeTokenByKeyAndMember(member_id: string, key: string) {
    const tokens = await this.tokenStatusByKeyAndMember(member_id, key);

    for (const token of tokens) {
      await this.redisClient.DEL(token.token_key);
    }
  }
}
