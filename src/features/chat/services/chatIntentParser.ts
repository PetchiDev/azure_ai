import { ParsedIntent, AzureAction, AzureEntity } from '../types/chat.types';

const ACTION_PATTERNS: Record<AzureAction, string[]> = {
  list: ['list', 'show all', 'get all', 'fetch', 'display all', 'what are my', 'all my'],
  create: ['create', 'make', 'new', 'add', 'provision', 'deploy', 'setup'],
  delete: ['delete', 'remove', 'destroy', 'drop', 'terminate'],
  update: ['update', 'modify', 'change', 'edit', 'rename', 'scale'],
  show: ['show', 'detail', 'info', 'describe', 'status', 'check status', 'get'],
  check: ['check', 'billing', 'cost', 'spend', 'how much', 'price'],
  unknown: [],
};

const ENTITY_PATTERNS: Record<AzureEntity, string[]> = {
  blob: ['blob', 'storage', 'container', 'bucket', 'file storage'],
  function: ['function', 'serverless', 'azure function'],
  'app-registration': ['app registration', 'app reg', 'application', 'service principal', 'client app', 'entra app'],
  'user-access': ['user', 'access', 'rbac', 'role', 'permission', 'assignment', 'who has', 'iam'],
  resource: ['resource', 'vm', 'virtual machine', 'web app', 'sql', 'database', 'aks', 'container'],
  billing: ['billing', 'cost', 'invoice', 'spending', 'charges', 'budget'],
  logs: ['log', 'activity', 'audit', 'event', 'history'],
  metrics: ['metric', 'monitor', 'performance', 'cpu', 'memory', 'throughput'],
  subscription: ['subscription', 'tenant', 'directory'],
  unknown: [],
};

function extractParams(input: string): Record<string, string> {
  const params: Record<string, string> = {};
  
  // Extract name in quotes or after 'named'/'called'
  const nameMatch = input.match(/(?:named?|called?)\s+["']?([a-zA-Z0-9_\-]+)["']?/i);
  if (nameMatch) params.name = nameMatch[1];

  // Extract resource group
  const rgMatch = input.match(/(?:resource group|in rg|rg)\s+["']?([a-zA-Z0-9_\-]+)["']?/i);
  if (rgMatch) params.resourceGroup = rgMatch[1];

  // Extract location
  const locMatch = input.match(/(?:in|at|location)\s+(?:eastus|westus|centralus|southeastasia|eastasia|westeurope|northeurope)/i);
  if (locMatch) params.location = locMatch[0].replace(/in|at|location/i, '').trim();

  return params;
}

export function parseIntent(input: string): ParsedIntent {
  const lower = input.toLowerCase();

  // Detect action
  let detectedAction: AzureAction = 'unknown';
  for (const [action, patterns] of Object.entries(ACTION_PATTERNS) as [AzureAction, string[]][]) {
    if (action === 'unknown') continue;
    if (patterns.some(p => lower.includes(p))) {
      detectedAction = action;
      break;
    }
  }

  // Detect entity
  let detectedEntity: AzureEntity = 'unknown';
  for (const [entity, patterns] of Object.entries(ENTITY_PATTERNS) as [AzureEntity, string[]][]) {
    if (entity === 'unknown') continue;
    if (patterns.some(p => lower.includes(p))) {
      detectedEntity = entity;
      break;
    }
  }

  return {
    action: detectedAction,
    entity: detectedEntity,
    params: extractParams(input),
    rawInput: input,
  };
}
