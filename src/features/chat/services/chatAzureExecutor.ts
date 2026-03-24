import { ParsedIntent } from '../types/chat.types';
import {
  getResources,
  getStorageAccounts,
  getFunctionApps,
  getActivityLogs,
  getBillingDetails,
  getSubscriptions,
  deleteResource,
  createStorageAccount,
  getRoleAssignments,
} from '../../resources/services/azureService';

export interface ExecutorResult {
  summary: string;
  data?: any[];
  isError?: boolean;
}

export async function executeIntent(intent: ParsedIntent): Promise<ExecutorResult> {
  const { action, entity, params } = intent;

  try {
    // ── LIST ─────────────────────────────────────────
    if (action === 'list' || action === 'show') {
      switch (entity) {
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
        default:
          break;
      }
    }

    // ── CHECK / BILLING ──────────────────────────────
    if (action === 'check' || entity === 'billing') {
      const data = await getBillingDetails();
      const rows = data?.properties?.rows ?? [];
      const total = rows.reduce((acc: number, r: any[]) => acc + (parseFloat(r[1]) || 0), 0);
      return {
        summary: `💰 Current month estimated cost: **$${total.toFixed(2)} USD**\n${data?.isSimulated ? '_Note: Billing APIs restricted for your subscription type — showing resource-based estimate._' : ''}`,
        data: rows.map((r: any[]) => ({ resourceGroup: r[0], cost: `$${parseFloat(r[1]).toFixed(2)}`, currency: r[2] })),
      };
    }

    // ── CREATE ───────────────────────────────────────
    if (action === 'create') {
      switch (entity) {
        case 'blob': {
          if (!params.name || !params.resourceGroup) {
            return { summary: '⚠️ Please specify a name and resource group. Example: _"create blob storage named myblob in resource group myRG"_' };
          }
          const result = await createStorageAccount(params.name, params.resourceGroup, params.location || 'eastus');
          return { summary: `✅ Storage account **${params.name}** created in **${params.resourceGroup}**.`, data: [result] };
        }
        default:
          return { summary: `⚠️ Create for **${entity}** is not yet fully supported via chat. Use the Resources tab for advanced management.` };
      }
    }

    // ── DELETE ───────────────────────────────────────
    if (action === 'delete') {
      if (!params.name) {
        return { summary: '⚠️ Please specify the resource name to delete. Example: _"delete function app named myFunc"_' };
      }
      const resources = await getResources();
      const target = resources?.find((r: any) => r.name?.toLowerCase() === params.name?.toLowerCase());
      if (!target) {
        return { summary: `❌ Could not find any resource named **${params.name}** in your subscription.` };
      }
      await deleteResource(target.id);
      return { summary: `✅ Resource **${params.name}** has been deleted.` };
    }

    // ── FALLBACK ─────────────────────────────────────
    return {
      summary: `🤔 I wasn't sure how to handle that. Here are things I can help with:\n\n• _"list all blobs"_\n• _"show function apps"_\n• _"check billing"_\n• _"show activity logs"_\n• _"who has access"_\n• _"list all resources"_`,
    };
  } catch (err: any) {
    return {
      summary: `❌ Azure error: ${err?.response?.data?.error?.message || err.message}`,
      isError: true,
    };
  }
}
