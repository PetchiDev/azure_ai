import { ParsedIntent, AzureAction, AzureEntity } from '../types/chat.types';
import { AZURE_PROVIDER_MAP } from './azureProviderMap';

const ACTION_PATTERNS: Record<AzureAction, string[]> = {
  list: ['list', 'show all', 'get all', 'fetch', 'display all', 'what are my', 'all my'],
  create: ['create', 'make', 'new', 'add', 'provision', 'deploy', 'setup', 'grant', 'assign'],
  delete: ['delete', 'remove', 'destroy', 'drop', 'terminate'],
  update: ['update', 'modify', 'change', 'edit', 'rename', 'scale'],
  show: ['show', 'detail', 'info', 'describe', 'status', 'check status', 'get'],
  check: ['check', 'billing', 'cost', 'spend', 'how much', 'price'],
  unknown: [],
};

const ENTITY_PATTERNS: Record<AzureEntity, string[]> = {
  // Order matters: check specific entities BEFORE generic 'resource'
  'resource-group': ['resource group', 'resource-group', 'resourcegroup', 'rg list', 'all rg', 'list rg'],
  blob:             ['blob', 'storage account', 'storage', 'container', 'bucket', 'file storage'],
  function:         ['function app', 'function', 'serverless', 'azure function'],
  webapp:           ['web app', 'webapp', 'app service'],
  'app-registration': ['app registration', 'app reg', 'application', 'service principal', 'client app', 'entra app'],
  'user-access':    ['user', 'access', 'rbac', 'role', 'permission', 'assignment', 'who has', 'iam'],
  resource:         ['resource', 'thing', 'everything', 'all'],
  database:         ['database', 'db', 'sql', 'cosmos', 'postgres'],
  billing:          ['billing', 'cost', 'invoice', 'spending', 'charges', 'budget'],
  logs:             ['log', 'activity', 'audit', 'event', 'history'],
  metrics:          ['metric', 'monitor', 'performance', 'cpu', 'memory', 'throughput'],
  subscription:     ['subscription', 'tenant', 'directory'],
  universal:        [], // Mapped dynamically via AZURE_PROVIDER_MAP
  unknown:          [],
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

  // Extract Principal ID (GUID)
  const guidMatch = input.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
  if (guidMatch) params.principalId = guidMatch[0];

  // Extract Role Name
  const roleMatch = input.match(/(?:grant|assign)\s+(Owner|Contributor|Reader)/i);
  if (roleMatch) params.roleName = roleMatch[1].charAt(0).toUpperCase() + roleMatch[1].slice(1).toLowerCase();

  // Extract Tags (key=value)
  const tagMatch = input.match(/(?:tag|with)\s+([a-zA-Z0-9_\-]+)\s*=\s*([a-zA-Z0-9_\-]+)/i);
  if (tagMatch) {
    params.tagKey = tagMatch[1];
    params.tagValue = tagMatch[2];
  }

  // Extract SKU / Scale
  const skuMatch = input.match(/(?:scale to|sku|plan)\s+(Free|Standard|Premium|Basic|S1|P1v2|B1)/i);
  if (skuMatch) params.sku = skuMatch[1];

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

  const params = extractParams(input);

  // 3. Fallback: Search in the 50+ services provider map
  if (detectedEntity === 'unknown' || detectedEntity === 'resource' || detectedEntity === 'database') {
    for (const [keyword, provider] of Object.entries(AZURE_PROVIDER_MAP)) {
      if (lower.includes(keyword)) {
        detectedEntity = 'universal';
        params.provider = provider;
        params.serviceKeyword = keyword;
        break;
      }
    }
  }

  return {
    action: detectedAction,
    entity: detectedEntity,
    params,
    rawInput: input,
  };
}
