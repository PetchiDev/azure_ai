import apiClient from '@/api/client';

// Helper to get subscription ID if not provided (discovery)
export const getSubscriptions = async () => {
  const response = await apiClient.get('/subscriptions?api-version=2022-12-01');
  return response.data.value;
};

// Resources
export const getResources = async () => {
  // Fetches all resources in the subscription
  const response = await apiClient.get('/subscriptions/{subscriptionId}/resources?api-version=2021-04-01');
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

// Resource Metrics (for monitoring queries)
export const getResourceMetrics = async (resourceId: string, metricName: string = 'Percentage CPU') => {
  const now = new Date();
  const start = new Date(now.getTime() - 60 * 60 * 1000).toISOString(); // 1h ago
  const end = now.toISOString();
  const response = await apiClient.get(
    `${resourceId}/providers/Microsoft.Insights/metrics?api-version=2019-07-01&metricnames=${metricName}&timespan=${start}/${end}&interval=PT5M`
  );
  return response.data.value;
};
