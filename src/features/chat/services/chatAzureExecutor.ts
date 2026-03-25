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

export async function executeIntent(intent: ParsedIntent): Promise<ExecutorResult> {
  const { action, entity, params, rawInput } = intent;

  // ── REGISTER (Priority) ───────────────────────────
  if (rawInput.toLowerCase().includes('register')) {
    const namespace = rawInput.match(/register\s+([a-zA-Z0-9\.]+)/i)?.[1];
    if (namespace) {
      await registerResourceProvider(namespace);
      return { summary: `✅ Registration request for **${namespace}** has been sent. This usually takes 1-2 minutes to complete.` };
    }
  }

  try {
    // ── LIST / SHOW ──────────────────────────────────
    if (action === 'list' || action === 'show') {
      switch (entity) {
        case 'resource-group': {
          const data = await getResourceGroups();
          return {
            summary: `Found **${data?.length ?? 0}** resource groups in your subscription.`,
            data: data?.map((rg: any) => ({
              name: rg.name,
              location: rg.location,
              state: rg.properties?.provisioningState,
            })),
          };
        }
        case 'blob': {
          const data = await getStorageAccounts();
          return {
            summary: `Found **${data?.length ?? 0}** storage accounts in your subscription.`,
            data: data?.map((s: any) => ({ name: s.name, location: s.location, rg: s.id?.split('/')?.[4] })),
          };
        }
        case 'function': {
          const data = await getFunctionApps();
          return {
            summary: `Found **${data?.length ?? 0}** function apps.`,
            data: data?.map((f: any) => ({ name: f.name, state: f.properties?.state, location: f.location })),
          };
        }
        case 'app-registration': {
          const data = await getAppRegistrations();
          return {
            summary: `Found **${data?.length ?? 0}** app registrations.`,
            data: data?.map((a: any) => ({ name: a.displayName, appId: a.appId, objectId: a.id })),
          };
        }
        case 'database': {
          const data = await getSqlDatabases();
          return {
            summary: `Found **${data?.length ?? 0}** SQL Servers.`,
            data: data?.map((s: any) => ({ name: s.name, location: s.location })),
          };
        }
        case 'universal': {
          const type = params.provider;
          const service = params.serviceKeyword || 'resource';
          const resources = await getResources();
          const filtered = resources?.filter((r: any) => r.type?.toLowerCase().includes(type?.toLowerCase() || ''));
          return {
            summary: `Found **${filtered?.length ?? 0}** ${service} resources.`,
            data: filtered?.map((r: any) => ({ name: r.name, location: r.location, type: r.type })),
          };
        }
        case 'metrics': {
          // If a name is provided, show metrics for it
          if (params.name) {
            const resources = await getResources();
            const target = resources?.find((r: any) => r.name?.toLowerCase() === params.name?.toLowerCase());
            if (target) {
              const data = await getResourceMetrics(target.id);
              return {
                summary: `📈 **CPU Usage** metrics for **${target.name}** (last 1h).`,
                data: data?.[0]?.timeseries?.[0]?.data?.map((d: any) => ({ time: new Date(d.timeStamp).toLocaleTimeString(), value: d.average + '%' })) || [],
              };
            }
          }
          return { summary: '⚠️ Please specify a resource name to show metrics for. _(e.g., "show metrics for myvm")_' };
        }
        case 'resource': {
          const data = await getResources();
          return {
            summary: `Found **${data?.length ?? 0}** resources in your subscription.`,
            data: data?.slice(0, 15).map((r: any) => ({ name: r.name, type: r.type, location: r.location })),
          };
        }
        case 'user-access': {
          const data = await getRoleAssignments();
          return {
            summary: `Found **${data?.length ?? 0}** role assignments.`,
            data: data?.slice(0, 10).map((r: any) => ({
              principal: r.properties?.principalId,
              role: r.properties?.roleDefinitionId?.split('/')?.pop(),
              scope: r.properties?.scope,
            })),
          };
        }
        case 'logs': {
          const data = await getActivityLogs();
          return {
            summary: `Showing **${data?.length ?? 0}** recent activity log entries (last 30 days).`,
            data: data?.slice(0, 10).map((l: any) => ({
              operation: l.operationName?.localizedValue || l.operationName?.value,
              status: l.status?.value,
              caller: l.caller,
              time: l.eventTimestamp,
            })),
          };
        }
        case 'subscription': {
          const data = await getSubscriptions();
          return {
            summary: `Found **${data?.length ?? 0}** subscriptions.`,
            data: data?.map((s: any) => ({ name: s.displayName, id: s.subscriptionId, state: s.state })),
          };
        }
        default: break;
      }
    }

    // ── CHECK / BILLING ──────────────────────────────
    if (action === 'check' || entity === 'billing') {
      const data = await getBillingDetails();
      const rows = data?.properties?.rows ?? [];
      const total = rows.reduce((acc: number, r: any[]) => acc + (parseFloat(r[1]) || 0), 0);
      return {
        summary: `💰 Current month estimated cost: **$${total.toFixed(2)} USD**${data?.isSimulated ? '\n_Note: Billing API restricted — showing resource-based estimate._' : ''}`,
        data: rows.map((r: any[]) => ({ resourceGroup: r[0], cost: `$${parseFloat(r[1]).toFixed(2)}`, currency: r[2] })),
      };
    }

    // ── CREATE ───────────────────────────────────────
    if (action === 'create') {
      const entityKey = entity === 'resource' && params.type ? params.type : entity;
      const allFields = CREATION_FIELDS[entityKey] ?? ['name', 'resourceGroup', 'location'];
      const missing = allFields.filter(f => !params[f]);

      if (missing.length > 0) {
        // Start guided creation
        return startGuidedCreation(entityKey, params);
      }
      // All params already in the sentence — execute directly
      return executeCreation(entityKey, params);
    }

    // ── DELETE ───────────────────────────────────────
    if (action === 'delete') {
      if (!params.name) {
        return { summary: '⚠️ Please specify the resource name. Example: _"delete resource group named my-rg"_' };
      }

      // Resource Group delete — uses name directly (name case-insensitive)
      if (entity === 'resource-group') {
        const rgs = await getResourceGroups();
        const target = rgs?.find((r: any) => r.name?.toLowerCase() === params.name?.toLowerCase());
        if (!target) {
          return { summary: `❌ Could not find resource group **${params.name}** in your subscription.\n\nTip: Use _"list all resource groups"_ to see exact names.` };
        }
        await deleteResourceGroup(target.name);
        return { summary: `✅ Resource group **${target.name}** deletion initiated. Azure is removing it — this may take a minute.` };
      }

      // Generic resource delete (VMs, apps, storage, etc.) — needs ARM ID lookup
      const resources = await getResources();
      const target = resources?.find((r: any) => r.name?.toLowerCase() === params.name?.toLowerCase());
      if (!target) {
        return { summary: `❌ Could not find any resource named **${params.name}**.\n\nTip: Use _"list all resources"_ or _"list all resource groups"_ to see exact names.` };
      }
      await deleteResource(target.id);
      return { summary: `✅ Resource **${params.name}** (${target.type}) has been deleted.` };
    }

    // ── UPDATE ───────────────────────────────────────
    if (action === 'update') {
      if (!params.name) {
        return { summary: '⚠️ Please specify the resource name to update. Example: _"tag resource myStorage with owner=anna"_ or _"scale web app myApp to Standard"_' };
      }

      // Case 1: Tagging
      if (params.tagKey && params.tagValue) {
        const resources = await getResources();
        const target = resources?.find((r: any) => r.name?.toLowerCase() === params.name?.toLowerCase());
        if (!target) return { summary: `❌ Could not find resource **${params.name}** to tag.` };

        await updateResourceTags(target.id, { [params.tagKey]: params.tagValue });
        return {
          summary: `✅ Resource **${target.name}** updated with tag: **${params.tagKey}=${params.tagValue}**.`,
          data: [{ name: target.name, tag: `${params.tagKey}=${params.tagValue}` }],
        };
      }

      // Case 2: Scaling (Web App)
      if (params.sku && entity === 'webapp') {
        const resources = await getResources();
        const target = resources?.find((r: any) => r.name?.toLowerCase() === params.name?.toLowerCase());
        if (!target) return { summary: `❌ Could not find web app **${params.name}** to scale.` };

        // Scale the associated App Service Plan (usually named plan-name or we look it up)
        // For simplicity, we assume the plan is in the same RG
        const rg = target.id?.split('/')?.[4];
        // Web apps often have a plan ID in properties
        // But for now, we'll try to scale the plan named like the app if not found
        const planName = `${target.name}-plan`; 
        await updateAppServicePlan(rg, planName, params.sku);
        return {
          summary: `✅ Web App **${target.name}** scaled to plan: **${params.sku}**.`,
          data: [{ app: target.name, plan: planName, newSku: params.sku }],
        };
      }

      return { summary: '⚠️ I understood you want to update, but I need more details (like tags or a new scale/sku).' };
    }

    // ── FALLBACK ─────────────────────────────────────
    return {
      summary: `🤔 I wasn't sure how to handle that. Here are things I can help with:\n\n• _"list all resources"_\n• _"create storage account"_\n• _"create function app"_\n• _"check billing"_\n• _"show activity logs"_\n• _"who has access"_`,
    };
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
      summary: `❌ Azure error: ${errorMsg}`,
      isError: true,
    };
  }
}

