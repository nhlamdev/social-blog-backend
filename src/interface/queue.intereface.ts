export interface IQueueMailPayload {
  to: string;
  from: string;
  title: string;
  content: string | null;
  type: 'create-content' | 'create-content' | 'create-reply';
}

export interface IQueueContentNotify {
  to: string;
  from: string;
  title: string;
  content: string | null;
  type: 'create-content' | 'create-content' | 'create-reply';
}
