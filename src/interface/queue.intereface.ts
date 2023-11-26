export interface IQueueMailPayload {
  to: string;
  title: string;
  content: string | null;
}

export interface IQueueContentNotify {
  to: string;
  from: string;
  title: string;
  content: string | null;
  type: 'create-content' | 'create-content' | 'create-reply';
}
