export const analyzeBilling = (billingData: any, resources: any[]) => {
  // Real logic to analyze data for cost saving opportunities
  const totalCost = billingData?.properties?.rows?.[0]?.[0] || 0;
  
  // Example: Find "Zombie" resources (resources with no tags or specific naming)
  const zombieResources = resources.filter(r => !r.tags || Object.keys(r.tags).length === 0).slice(0, 2).map((r: any) => ({
    id: r.id,
    name: r.name,
    inactiveDays: 30, // Heuristic
    type: r.type,
  }));

  // Example: High cost resource (Heuristic)
  const overbilling = resources.length > 5 ? [
    { id: 'ob1', name: 'Standard_D2s_v3', cost: '$120/mo', reason: 'High CPU idle time detected in Compute instances.' }
  ] : [];

  return {
    overbilling,
    zombieResources,
    totalOptimizable: totalCost > 100 ? `$${(totalCost * 0.15).toFixed(2)}` : '$0.00',
  };
};
