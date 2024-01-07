import { MemberEntity } from '@/database/entities';
import { ISocialPayload, client_data } from '@/shared/types';

export interface IRefreshTokenCreate {
  client: client_data;
  social_payload: ISocialPayload;
  member_id: string;
}

export interface IAccessTokenCreate {
  member: MemberEntity;
  token_refresh_id: string;
}
