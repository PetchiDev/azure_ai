export const AZURE_PROVIDER_MAP: Record<string, string> = {
  // Compute
  'virtual machine': 'Microsoft.Compute/virtualMachines',
  'vm': 'Microsoft.Compute/virtualMachines',
  'app service': 'Microsoft.Web/sites',
  'web app': 'Microsoft.Web/sites',
  'function': 'Microsoft.Web/sites',
  'container app': 'Microsoft.App/containerApps',
  'aks': 'Microsoft.ContainerService/managedClusters',
  'kubernetes': 'Microsoft.ContainerService/managedClusters',
  'batch': 'Microsoft.Batch/batchAccounts',

  // Storage
  'blob': 'Microsoft.Storage/storageAccounts',
  'storage account': 'Microsoft.Storage/storageAccounts',
  'file storage': 'Microsoft.Storage/storageAccounts',
  'queue storage': 'Microsoft.Storage/storageAccounts',
  'table storage': 'Microsoft.Storage/storageAccounts',
  'data lake': 'Microsoft.Storage/storageAccounts',
  'disk': 'Microsoft.Compute/disks',

  // Databases
  'sql database': 'Microsoft.Sql/servers/databases',
  'cosmos db': 'Microsoft.DocumentDB/databaseAccounts',
  'postgresql': 'Microsoft.DBforPostgreSQL/flexibleServers',
  'mysql': 'Microsoft.DBforMySQL/flexibleServers',
  'redis': 'Microsoft.Cache/redis',
  'synapse': 'Microsoft.Synapse/workspaces',
  'mariadb': 'Microsoft.DBforMariaDB/servers',

  // Networking
  'vnet': 'Microsoft.Network/virtualNetworks',
  'virtual network': 'Microsoft.Network/virtualNetworks',
  'load balancer': 'Microsoft.Network/loadBalancers',
  'application gateway': 'Microsoft.Network/applicationGateways',
  'cdn': 'Microsoft.Cdn/profiles',
  'dns': 'Microsoft.Network/dnsZones',
  'vpn gateway': 'Microsoft.Network/vpnGateways',
  'expressroute': 'Microsoft.Network/expressRouteCircuits',
  'front door': 'Microsoft.Cdn/profiles',
  'apim': 'Microsoft.ApiManagement/service',

  // Security
  'key vault': 'Microsoft.KeyVault/vaults',
  'managed identity': 'Microsoft.ManagedIdentity/userAssignedIdentities',
  'firewall': 'Microsoft.Network/azureFirewalls',

  // AI
  'openai': 'Microsoft.CognitiveServices/accounts',
  'cognitive services': 'Microsoft.CognitiveServices/accounts',
  'ai search': 'Microsoft.Search/searchServices',
  'bot service': 'Microsoft.BotService/botServices',

  // Messaging
  'service bus': 'Microsoft.ServiceBus/namespaces',
  'event hub': 'Microsoft.EventHub/namespaces',
  'event grid': 'Microsoft.EventGrid/topics',
  'logic app': 'Microsoft.Logic/workflows',

  // Monitoring
  'monitor': 'Microsoft.Insights/components',
  'log analytics': 'Microsoft.OperationalInsights/workspaces',
  'app insights': 'Microsoft.Insights/components',
  'automation': 'Microsoft.Automation/automationAccounts',
};

// Map labels for nice UI display
export const AZURE_ENTITY_LABELS: Record<string, string> = {
  'Microsoft.Compute/virtualMachines': 'Virtual Machine',
  'Microsoft.Web/sites': 'Web/Function App',
  'Microsoft.Storage/storageAccounts': 'Storage Account',
  'Microsoft.Sql/servers/databases': 'SQL Database',
  'Microsoft.Network/virtualNetworks': 'Virtual Network',
  // ... can be extended as needed
};
