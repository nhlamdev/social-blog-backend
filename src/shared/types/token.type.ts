import { MemberEntity } from '@/module/member/member.entity';
import { ISocialPayload, client_data } from '@/shared/types';

export interface IRefreshTokenCreate {
  client: client_data;
  social_payload: ISocialPayload;
  member_id: string;
}

export interface IAccessTokenCreate {
  member: MemberEntity;
  token_refresh_key: string;
}
