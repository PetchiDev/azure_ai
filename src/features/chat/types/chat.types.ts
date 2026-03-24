export type ChatRole = 'user' | 'assistant' | 'error';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  timestamp: Date;
  data?: any; // Raw Azure response for structured display
}

export type AzureEntity =
  | 'blob'
  | 'function'
  | 'app-registration'
  | 'user-access'
  | 'resource'
  | 'billing'
  | 'logs'
  | 'metrics'
  | 'subscription'
  | 'unknown';

export type AzureAction = 'list' | 'create' | 'delete' | 'update' | 'show' | 'check' | 'unknown';

export interface ParsedIntent {
  action: AzureAction;
  entity: AzureEntity;
  params: Record<string, string>; // e.g. { name: 'myblob', resourceGroup: 'myRG' }
  rawInput: string;
}
