import apiClient from '@/api/client';

// Helper to get subscription ID if not provided (discovery)
export const getSubscriptions = async () => {
  const response = await apiClient.get('/subscriptions?api-version=2022-12-01');
  return response.data.value;
};

// Resources
export const getResources = async () => {
  const response = await apiClient.get('/subscriptions/{subscriptionId}/resources?api-version=2021-04-01');
  return response.data.value;
};

// Resource Groups
export const getResourceGroups = async () => {
  const response = await apiClient.get('/subscriptions/{subscriptionId}/resourceGroups?api-version=2022-09-01');
  return response.data.value;
};

// App Registrations (Graph API usually, but ARM pass-through exists for some metrics)
export const getAppRegistrations = async () => {
  // Using the ARM-based Discovery for applications if available, 
  // otherwise this would normally be a direct Graph call.
  const response = await apiClient.get('/subscriptions/{subscriptionId}/providers/Microsoft.Graph/applications?api-version=2022-09-01');
  return response.data;
};

// Storage Accounts
export const getStorageAccounts = async () => {
  const response = await apiClient.get('/subscriptions/{subscriptionId}/providers/Microsoft.Storage/storageAccounts?api-version=2023-01-01');
  return response.data.value;
};

export const updateStorageTier = async (name: string, resourceGroup: string, tier: 'Hot' | 'Cool' = 'Hot') => {
  const response = await apiClient.patch(
    `/subscriptions/{subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Storage/storageAccounts/${name}?api-version=2023-01-01`,
    { properties: { accessTier: tier } }
  );
  return response.data;
};

// Function Apps
export const getFunctionApps = async () => {
  const response = await apiClient.get('/subscriptions/{subscriptionId}/providers/Microsoft.Web/sites?api-version=2022-09-01&filter=kind eq \'functionapp\'');
  return response.data.value;
};


// WebDirect/AIRS offer types that support Cost Management & Consumption APIs
const BILLING_SUPPORTED_OFFERS = [
  'MS-AZR-0003P', // Pay-As-You-Go
  'MS-AZR-0017P', // Enterprise Agreement
  'MS-AZR-0148P', // Dev/Test PAYG
];

// Helper to generate resource-based billing simulation
const generateResourceBasedBilling = async () => {
  try {
    const resources = await getResources();
    // Extract unique Resource Groups from real resources
    const rgs = [...new Set<string>(resources.map((r: any) => r.id?.split('/')?.[4] || 'default'))];
    const rows = rgs.map((rg: string) => [
      rg,
      parseFloat((Math.random() * 40 + 5).toFixed(2)), // Realistic: $5–$45 per RG
      'USD'
    ]);
    return {
      isSimulated: true,
      properties: {
        rows: rows.length > 0 ? rows : [['subscription-base', 15.00, 'USD']],
        columns: [
          { name: 'ResourceGroup', type: 'String' },
          { name: 'PreTaxCost', type: 'Number' },
          { name: 'Currency', type: 'String' }
        ]
      }
    };
  } catch {
    return {
      isSimulated: true,
      properties: {
        rows: [['subscription-base', 25.00, 'USD']],
        columns: [
          { name: 'ResourceGroup', type: 'String' },
          { name: 'PreTaxCost', type: 'Number' },
          { name: 'Currency', type: 'String' }
        ]
      }
    };
  }
};

// Billing / Cost Management
export const getBillingDetails = async () => {
  // Step 1: Check if this subscription supports billing APIs (avoid 404s)
  try {
    const subRes = await apiClient.get('/subscriptions/{subscriptionId}?api-version=2022-12-01');
    const offerId: string = subRes.data?.subscriptionPolicies?.quotaId || '';
    const isSupported = BILLING_SUPPORTED_OFFERS.some(id => offerId.includes(id));

    if (!isSupported) {
      console.info(`Subscription offer "${offerId}" does not support Cost Management/Consumption APIs. Using resource-based simulation.`);
      return generateResourceBasedBilling();
    }
  } catch {
    // If we can't check, fallback to simulation to avoid crashing
    return generateResourceBasedBilling();
  }

  // Step 2: Only call billing APIs for supported subscription types
  try {
    const response = await apiClient.post('/subscriptions/{subscriptionId}/providers/Microsoft.CostManagement/query?api-version=2023-03-01', {
      type: 'Usage',
      timeframe: 'MonthToDate',
      dataset: {
        granularity: 'None',
        aggregation: { totalCost: { name: 'PreTaxCost', function: 'Sum' } },
        grouping: [{ type: 'Dimension', name: 'ResourceGroup' }]
      }
    });
    return response.data;
  } catch {
    return generateResourceBasedBilling();
  }
};

// Activity Logs (Azure Monitor)
export const getActivityLogs = async () => {
  // Use a relative date (last 30 days) to avoid the 90-day constraint
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dateString = thirtyDaysAgo.toISOString();
  
  const response = await apiClient.get(`/subscriptions/{subscriptionId}/providers/Microsoft.Insights/eventtypes/management/values?api-version=2015-04-01&$filter=eventTimestamp ge datetime'${dateString}'`);
  return response.data.value;
};

// Operations
export const createAppRegistration = async (data: any) => {
  const response = await apiClient.post('/subscriptions/{subscriptionId}/providers/Microsoft.Graph/applications', data);
  return response.data;
};

export const deleteResource = async (resourceId: string) => {
  // resourceId should be the full Azure Resource ID
  const response = await apiClient.delete(`${resourceId}?api-version=2021-04-01`);
  return response.data;
};

// Delete Resource Group (different endpoint from generic resource delete)
export const deleteResourceGroup = async (name: string) => {
  const response = await apiClient.delete(
    `/subscriptions/{subscriptionId}/resourceGroups/${name}?api-version=2022-09-01`
  );
  return response.data; // 202 Accepted (async deletion in Azure)
};

// Create Storage Account (for chat commands)
export const createStorageAccount = async (name: string, resourceGroup: string, location: string = 'eastus') => {
  const response = await apiClient.put(
    `/subscriptions/{subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Storage/storageAccounts/${name}?api-version=2023-01-01`,
    {
      sku: { name: 'Standard_LRS' },
      kind: 'StorageV2',
      location,
      properties: {},
    }
  );
  return response.data;
};

// Role Assignments (RBAC) — who has access to what
export const getRoleAssignments = async () => {
  const response = await apiClient.get('/subscriptions/{subscriptionId}/providers/Microsoft.Authorization/roleAssignments?api-version=2022-04-01');
  return response.data.value;
};

export const createRoleAssignment = async (principalId: string, roleName: string = 'Reader', scope: string = '/subscriptions/{subscriptionId}') => {
  // Common Role Definition IDs
  const ROLE_IDS: Record<string, string> = {
    'Owner': '8e3af657-a8ff-443c-a75c-2fe8c4bcb635',
    'Contributor': 'b24988ac-6180-42a0-ab88-20f7382dd24c',
    'Reader': 'acdd72a7-3385-400d-805a-9110a3915bc8',
  };

  const roleId = ROLE_IDS[roleName] || ROLE_IDS['Reader'];
  const assignmentName = crypto.randomUUID?.() || Math.random().toString(36).substring(7);

  const response = await apiClient.put(
    `${scope}/providers/Microsoft.Authorization/roleAssignments/${assignmentName}?api-version=2022-04-01`,
    {
      properties: {
        roleDefinitionId: `/subscriptions/{subscriptionId}/providers/Microsoft.Authorization/roleDefinitions/${roleId}`,
        principalId,
      },
    }
  );
  return response.data;
};

// Resource Metrics (for monitoring queries)
export const getResourceMetrics = async (resourceId: string, metricName: string = 'Percentage CPU') => {
  const now = new Date();
  const start = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const end = now.toISOString();
  const response = await apiClient.get(
    `${resourceId}/providers/Microsoft.Insights/metrics?api-version=2019-07-01&metricnames=${metricName}&timespan=${start}/${end}&interval=PT5M`
  );
  return response.data.value;
};

// Create Resource Group
export const createResourceGroup = async (name: string, location: string = 'eastus') => {
  const response = await apiClient.put(
    `/subscriptions/{subscriptionId}/resourceGroups/${name}?api-version=2022-09-01`,
    { location, tags: { createdBy: 'AzureAIChat' } }
  );
  return response.data;
};

// Update Resource Tags
export const updateResourceTags = async (resourceId: string, tags: Record<string, string>) => {
  const response = await apiClient.patch(
    `${resourceId}?api-version=2021-04-01`,
    { tags }
  );
  return response.data;
};

// Update App Service Plan (Scaling)
export const updateAppServicePlan = async (resourceGroup: string, planName: string, sku: string) => {
  // Map common names to Azure SKU objects
  const SKU_MAP: Record<string, any> = {
    'Free': { name: 'F1', tier: 'Free' },
    'S1': { name: 'S1', tier: 'Standard' },
    'B1': { name: 'B1', tier: 'Basic' },
    'P1v2': { name: 'P1v2', tier: 'PremiumV2' },
  };

  const selectedSku = SKU_MAP[sku] || SKU_MAP['S1'];
  
  const response = await apiClient.patch(
    `/subscriptions/{subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Web/serverfarms/${planName}?api-version=2022-09-01`,
    { sku: selectedSku }
  );
  return response.data;
};

// Create Function App (requires App Service Plan + Storage Account pre-existing)
export const createFunctionApp = async (name: string, resourceGroup: string, location: string = 'eastus', storageAccountName: string = '') => {
  const response = await apiClient.put(
    `/subscriptions/{subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Web/sites/${name}?api-version=2022-09-01`,
    {
      location,
      kind: 'functionapp',
      properties: {
        siteConfig: {
          appSettings: storageAccountName ? [
            { name: 'AzureWebJobsStorage', value: `DefaultEndpointsProtocol=https;AccountName=${storageAccountName}` },
            { name: 'FUNCTIONS_EXTENSION_VERSION', value: '~4' },
            { name: 'FUNCTIONS_WORKER_RUNTIME', value: 'node' },
          ] : [],
        },
        httpsOnly: true,
      },
    }
  );
  return response.data;
};

// Create Web App
export const createWebApp = async (name: string, resourceGroup: string, location: string = 'eastus') => {
  // First create a free App Service Plan
  await apiClient.put(
    `/subscriptions/{subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Web/serverfarms/${name}-plan?api-version=2022-09-01`,
    {
      location,
      sku: { name: 'F1', tier: 'Free' },
      properties: {},
    }
  );
  // Then create the web app referencing the plan
  const response = await apiClient.put(
    `/subscriptions/{subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Web/sites/${name}?api-version=2022-09-01`,
    {
      location,
      kind: 'app',
      properties: {
        serverFarmId: `/subscriptions/{subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Web/serverfarms/${name}-plan`,
        httpsOnly: true,
      },
    }
  );
  return response.data;
};

// SQL Databases
export const getSqlDatabases = async () => {
  const response = await apiClient.get('/subscriptions/{subscriptionId}/providers/Microsoft.Sql/servers?api-version=2021-11-01');
  return response.data.value;
};

export const createSqlDatabase = async (name: string, serverName: string, resourceGroup: string, location: string = 'eastus') => {
  const response = await apiClient.put(
    `/subscriptions/{subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Sql/servers/${serverName}/databases/${name}?api-version=2021-11-01`,
    {
      location,
      sku: { name: 'Basic', tier: 'Basic', capacity: 5 },
      properties: {},
    }
  );
  return response.data;
};

// Generic Resource Creator (Fallback for all 50+ services)
export const createGenericResource = async (type: string, name: string, resourceGroup: string, location: string = 'eastus', properties: any = {}) => {
  const response = await apiClient.put(
    `/subscriptions/{subscriptionId}/resourceGroups/${resourceGroup}/providers/${type}/${name}?api-version=2021-04-01`,
    {
      location,
      properties,
    }
  );
  return response.data;
};

// Register Resource Provider
export const registerResourceProvider = async (namespace: string) => {
  const response = await apiClient.post(
    `/subscriptions/{subscriptionId}/providers/${namespace}/register?api-version=2021-04-01`
  );
  return response.data;
};
