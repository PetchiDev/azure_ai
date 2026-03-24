export type ChatRole = 'user' | 'assistant' | 'error';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  timestamp: Date;
  data?: any;
}

export type AzureEntity =
  | 'blob'
  | 'function'
  | 'webapp'
  | 'resource-group'
  | 'app-registration'
  | 'user-access'
  | 'resource'
  | 'billing'
  | 'logs'
  | 'metrics'
  | 'subscription'
  | 'database'
  | 'universal'
  | 'unknown';

export type AzureAction = 'list' | 'create' | 'delete' | 'update' | 'show' | 'check' | 'unknown';

export interface ParsedIntent {
  action: AzureAction;
  entity: AzureEntity;
  params: Record<string, string>;
  rawInput: string;
}

// Multi-step guided creation state
export interface ConversationContext {
  action: AzureAction;
  entity: AzureEntity;
  collectedParams: Record<string, string>;
  pendingField: string;       // field we're currently asking for
  remainingFields: string[];   // fields still needed after this one
}

export interface ExecutorResult {
  summary: string;
  data?: any[];
  isError?: boolean;
  needsInput?: boolean;                // true when we need more info
  nextContext?: ConversationContext;   // passed back to ChatScreen
}
