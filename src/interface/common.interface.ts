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

export interface owner_visualize {
  total_member_access: number;
  total_member_online: number;
  total_memory_use: number;
}

export interface IMailTemplateConfig {
  from?: string;
  to: string;
  subject: string;
  text?: string;

  template?: {
    name: string;
    context: any;
  };
}
