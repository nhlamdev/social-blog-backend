export interface IAccessJwtPayload {
  _id: string;
  name: string;
  email: string;
  image: string;
  expired: number;
  created_at: Date;
  refresh_token: string;
  token_created_at: Date;
  exp?: number;
  iat?: number;
  role: {
    owner: boolean;
    comment: boolean;
    author: boolean;
  };
}

export interface IRefreshJwtPayload {
  key: string;
  session_id: string;
  member_id: string;
}

export interface IRefreshTokenCache {
  token_key: string;
  provider_id: string;
  provider: 'google' | 'discord' | 'github';
  os: string;
  device: string;
  browser: string;
  ip: string;
  member_id: string;
  create_at: string;
}

export interface ISocialPayload {
  provider: 'discord' | 'google' | 'github';
  id: string;
  name: string;
  email: string;
  image: string;
}
