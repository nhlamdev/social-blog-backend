export interface AccessJwtPayload {
  _id: string;
  provider_id: string;
  provider: 'github' | 'google' | 'facebook' | 'discord';
  role: 'member' | 'owner';
}

export interface RefreshJwtPayload {
  session_id: string;
}
