export type TypeQueueProcessors =
  | 'MAIL_QUEUE'
  | 'SESSION_QUEUE'
  | 'TOKEN_QUEUE'
  | 'MEMBER_QUEUE';

export const queueProcessors: { [key in TypeQueueProcessors]: string } = {
  MAIL_QUEUE: 'MAIL_QUEUE',
  SESSION_QUEUE: 'SESSION_QUEUE',
  TOKEN_QUEUE: 'TOKEN_QUEUE',
  MEMBER_QUEUE: 'MEMBER_QUEUE',
};

export const queueConfig = {
  MAIL_QUEUE: {
    MAIL_QUEUE_SUBSCRIBE_CREATE_CONTENT: 'MAIL_QUEUE_SUBSCRIBE_CREATE_CONTENT',
  },
  MEMBER_QUEUE: {},
  SESSION_QUEUE: {},
  TOKEN_QUEUE: { CREATE_REFRESH_TOKEN: 'CREATE_REFRESH_TOKEN' },
};
