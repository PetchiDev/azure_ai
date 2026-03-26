import { ParsedIntent, ConversationContext, ExecutorResult } from '../types/chat.types';
import {
  getResources,
  getResourceGroups,
  getStorageAccounts,
  getFunctionApps,
  getActivityLogs,
  getBillingDetails,
  getSubscriptions,
  deleteResource,
  deleteResourceGroup,
  createStorageAccount,
  createResourceGroup,
  createFunctionApp,
  createWebApp,
  getRoleAssignments,
  createRoleAssignment,
  getAppRegistrations,
  createAppRegistration,
  getResourceMetrics,
  updateResourceTags,
  updateAppServicePlan,
  getSqlDatabases,
  createSqlDatabase,
  createGenericResource,
  registerResourceProvider,
  getGenericResource,
  updateGenericResource,
} from '@/api/services/azureService';



// ── Field definitions for guided creation ────────────────────────────────────

const CREATION_FIELDS: Record<string, string[]> = {
  blob:             ['name', 'resourceGroup', 'location'],
  function:         ['name', 'resourceGroup', 'location'],
  webapp:           ['name', 'resourceGroup', 'location'],
  'resource-group': ['name', 'location'],
  'app-registration': ['name'],
  'user-access':    ['principalId', 'roleName'],
  'database':       ['name', 'resourceGroup', 'serverName', 'location'],
  'universal':      ['name', 'resourceGroup', 'location'],
  resource:         ['type', 'name', 'resourceGroup', 'location'],
};

const FIELD_PROMPTS: Record<string, string> = {
  name:          '📝 What name would you like to give it? _(e.g., myapp2024)_',
  resourceGroup: '📁 Which **resource group** should it be in? _(e.g., my-rg)_',
  serverName:    '🖥️ Which **SQL Server** name? _(e.g., myserver123)_',
  location:      '🌍 Which **Azure region**? _(e.g., eastus, westeurope, southeastasia)_',
  type:          '🔧 What **type** of resource? _(blob / function / webapp / resource-group)_',
  principalId:   '🆔 Please provide the **Principal ID** (User/App GUID) to grant access to.',
  roleName:      '🎖️ Which **role**? _(Owner, Contributor, Reader)_',
};

const ENTITY_LABELS: Record<string, string> = {
  blob:             'Storage Account',
  function:         'Function App',
  webapp:           'Web App',
  'resource-group': 'Resource Group',
  'app-registration': 'App Registration',
  'user-access':    'Role Assignment',
  resource:         'Resource',
};

// ── Guided creation entry point ───────────────────────────────────────────────

function startGuidedCreation(entity: string, knownParams: Record<string, string>): ExecutorResult {
  const fields = CREATION_FIELDS[entity] ?? ['name', 'resourceGroup', 'location'];
  const missing = fields.filter(f => !knownParams[f]);

  if (missing.length === 0) {
    // All params known — should not reach here, executor handles it
    return { summary: '✅ All parameters already collected.' };
  }

  const [first, ...rest] = missing;
  return {
    summary: `🛠️ Let's create a **${ENTITY_LABELS[entity] ?? entity}**!\n\n${FIELD_PROMPTS[first]}`,
    needsInput: true,
    nextContext: {
      action: 'create',
      entity: entity as any,
      collectedParams: { ...knownParams },
      pendingField: first,
      remainingFields: rest,
    },
  };
}

// ── Continue a guided creation (user answered a question) ────────────────────

export async function continueCreation(context: ConversationContext, userInput: string): Promise<ExecutorResult> {
  const params = { ...context.collectedParams, [context.pendingField]: userInput.trim() };

  // If there are more fields to collect, ask the next one
  if (context.remainingFields.length > 0) {
    const [next, ...rest] = context.remainingFields;
    return {
      summary: FIELD_PROMPTS[next],
      needsInput: true,
      nextContext: {
        ...context,
        collectedParams: params,
        pendingField: next,
        remainingFields: rest,
      },
    };
  }

  // All fields collected — execute creation
  return executeCreation(context.entity, params);
}

// ── Execute the actual Azure creation call ───────────────────────────────────

async function executeCreation(entity: string, params: Record<string, string>): Promise<ExecutorResult> {
  const { name, resourceGroup, location = 'eastus', type } = params;

  // Resolve 'resource' entity by type param
  const effectiveEntity = entity === 'resource' && type ? type : entity;

  try {
    switch (effectiveEntity) {
      case 'blob': {
        await createStorageAccount(name, resourceGroup, location);
        return {
          summary: `✅ **Storage Account \`${name}\`** created in resource group **${resourceGroup}** (${location}).\n\n_It may take 1-2 minutes to fully provision._`,
          data: [{ name, resourceGroup, location, type: 'StorageV2', sku: 'Standard_LRS' }],
        };
      }
      case 'function': {
        await createFunctionApp(name, resourceGroup, location);
        return {
          summary: `✅ **Function App \`${name}\`** created in **${resourceGroup}** (${location}).\n\n_Runtime: Node.js 18 · Extension: v4_`,
          data: [{ name, resourceGroup, location, kind: 'functionapp' }],
        };
      }
      case 'webapp': {
        await createWebApp(name, resourceGroup, location);
        return {
          summary: `✅ **Web App \`${name}\`** created in **${resourceGroup}** (${location}).\n\nPlan: Free (F1) · HTTPS only`,
          data: [{ name, resourceGroup, location, sku: 'Free F1', https: true }],
        };
      }
      case 'resource-group': {
        await createResourceGroup(name, location);
        return {
          summary: `✅ **Resource Group \`${name}\`** created in **${location}**.\n\nYou can now deploy resources into it!`,
          data: [{ name, location, tag: 'createdBy: AzureAIChat' }],
        };
      }
      case 'app-registration': {
        const result = await createAppRegistration({ displayName: name });
        return {
          summary: `✅ **App Registration \`${name}\`** created in Entra ID.`,
          data: [{ name: result.displayName, appId: result.appId, id: result.id }],
        };
      }
      case 'user-access': {
        const { principalId, roleName = 'Reader' } = params;
        await createRoleAssignment(principalId, roleName);
        return {
          summary: `✅ **${roleName}** access granted to principal **${principalId.substring(0, 8)}...** at subscription level.`,
          data: [{ principalId, role: roleName, scope: 'Subscription' }],
        };
      }
      case 'database': {
        const { serverName = 'default-server' } = params;
        await createSqlDatabase(name, serverName, resourceGroup, location);
        return {
          summary: `✅ **SQL Database \`${name}\`** created on server **${serverName}** in **${location}**.`,
          data: [{ name, server: serverName, location }],
        };
      }
      case 'universal': {
        const type = params.provider || 'Microsoft.Compute/virtualMachines';
        const service = params.serviceKeyword || 'resource';
        await createGenericResource(type, name, resourceGroup, location);
        return {
          summary: `✅ **${service.charAt(0).toUpperCase() + service.slice(1)} \`${name}\`** provisioned in **${location}**.`,
          data: [{ name, type, location }],
        };
      }
      default:
        return { summary: `⚠️ Resource type **${effectiveEntity}** creation is not yet fully supported via chat.\n\nSupported: _blob, function, webapp, resource-group, app-registration, user-access, database, plus 50+ others!_` };
    }
  } catch (err: any) {
    const errorData = err?.response?.data?.error;
    const errorMsg = errorData?.message || err?.message || 'Unknown error';
    const errorCode = errorData?.code || '';
    const isMissingReg = errorCode === 'MissingSubscriptionRegistration' || errorMsg.includes('MissingSubscriptionRegistration');

    if (isMissingReg) {
      const namespace = errorMsg.match(/namespace '([^']+)'/)?.[1] || 'Microsoft.Storage';
      return {
        summary: `❌ **Missing Registration**: Your subscription is not registered for **${namespace}**.\n\n**To fix this, type**: _"register provider ${namespace}"_`,
        isError: true,
      };
    }
    return {
      summary: `❌ Creation failed: ${errorMsg}`,
      isError: true,
    };
  }
}


// ── Main execute intent function ─────────────────────────────────────────────

import backendClient from '@/api/backendClient';

export async function executeIntent(intent: ParsedIntent, history: { role: string, content: string }[] = []): Promise<ExecutorResult> {
  const { rawInput } = intent;

  try {
    const response = await backendClient.post('/api/assistant/interact', {
      prompt: rawInput,
      history
    });

    return response.data;
  } catch (err: any) {
    console.error('Backend Integration Error:', err);
    return {
      summary: "❌ I'm having trouble connecting to my Assistant Core. Please ensure the backend is running.",
      isError: true
    };
  }
}

