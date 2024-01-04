export type TypeAuthConfig = {
  secret: string;
  expires: number;
  secretName: string;
  refreshSecret: string;
  refreshExpires: number;
  refreshSecretName: string;
};
