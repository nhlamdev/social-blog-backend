import { MemberService } from '@/module/member/member.service';
import { SessionService } from '@/module/session/session.service';
import { IAccessJwtPayload, IRefreshJwtPayload } from '@/shared/types';
import {
  IAccessTokenCreate,
  IRefreshTokenCreate,
} from '@/shared/types/token.type';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { v4 as uuidV4 } from 'uuid';
@Injectable({})
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
    private readonly memberService: MemberService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createRefreshToken(
    payload: IRefreshTokenCreate,
  ): Promise<{ key: string; name: string; token: string; expires: number }> {
    const { client, member_id, social_payload } = payload;

    const randomId: string = uuidV4();

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

    const member = await this.memberService.findOne({
      where: { _id: member_id },
    });

    const session = await this.sessionService.create({
      token_key: randomId,
      provider_id: social_payload.id,
      provider: social_payload.provider,
      os: os,
      device: device,
      browser: browser,
      ip: ip,
      created_by: member,
      expires_in: expires,
    });

    const newRefreshToken: IRefreshJwtPayload = {
      key: randomId,
      session_id: session._id,
      member_id: member_id,
    };

    const token = await this.jwtService.sign(newRefreshToken, {
      secret,
      expiresIn: expires * 1000,
    });

    await this.cacheManager.set(
      `token-${randomId}-${member_id}`,
      newRefreshToken,
      expires,
    );

    await this.cacheRefreshToken({
      token: newRefreshToken,
      expires,
    });

    return { key: randomId, name, expires, token };
  }

  async createAccessToken(payload: IAccessTokenCreate) {
    const { member, token_refresh_key } = payload;
    const name: string = this.configService.getOrThrow('auth.secretName');
    const secret: string = this.configService.getOrThrow('auth.secret');
    const expires: number = this.configService.getOrThrow('auth.expires');

    const newToken: IAccessJwtPayload = {
      _id: member._id,
      name: member.name,
      email: member.email,
      image: member.image,
      expired: expires,
      token_refresh_key: token_refresh_key,
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
      expiresIn: expires * 1000,
    });

    return { name, expires, token };
  }

  async cacheRefreshToken(payload: {
    token: IRefreshJwtPayload;
    expires: number;
  }) {
    const { token, expires } = payload;

    await this.cacheManager.set(
      `token-${token.key}-${token.member_id}`,
      token,
      expires,
    );
  }

  async verifyRefreshToken(token: string): Promise<IRefreshJwtPayload> {
    const secret: string = this.configService.getOrThrow('auth.refreshSecret');
    const tokenVerify: IRefreshJwtPayload = await this.jwtService.verifyAsync(
      token,
      {
        secret,
      },
    );

    return tokenVerify;
  }

  async findRefreshTokenInCache(payload: {
    key: string;
    member_id: string;
  }): Promise<IRefreshJwtPayload> {
    const { key, member_id } = payload;

    return await this.cacheManager.get(`token-${key}-${member_id}`);
  }

  async removeRefreshTokenByKeyAndMember(payload: {
    key: string;
    member_id: string;
  }) {
    const { key, member_id } = payload;

    return await this.cacheManager.del(`token-${key}-${member_id}`);
  }
}
