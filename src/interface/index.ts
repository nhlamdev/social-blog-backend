export interface client_data {
  os: {
    name: string;
    version: string;
  } | null;
  browser: {
    name: string;
    version: string;
  } | null;
  device: string | null;
  ip: string;
}
