export interface AccessJwtPayload {
  _id: string;
  name: string;
  email: string;
  image: string;
  expired: number;
  session_id: string;
  create_at: string;
}

export interface RefreshJwtPayload {
  session_id: string;
  expired: number;
  create_at: string;
}
