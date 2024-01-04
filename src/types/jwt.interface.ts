export interface AccessJwtPayload {
  _id: string;
  name: string;
  email: string;
  image: string;
  expired: number;
  session_id: string;
  create_at: string;
  role_author: boolean;
  role_comment: boolean;
  role_owner: boolean;
}

export interface RefreshJwtPayload {
  session_id: string;
  expired: number;
  create_at: string;
}
