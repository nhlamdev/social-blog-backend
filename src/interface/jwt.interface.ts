export interface AccessJwtPayload {
  _id: string;
  name: string;
  email: string;
  role: 'member' | 'writer' | 'developer' | 'owner';
  image: string;
  expired: number;
  create_at: string;
}

export interface RefreshJwtPayload {
  session_id: string;
  expired: number;
  create_at: string;
}
