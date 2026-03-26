import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image, ActivityIndicator } from 'react-native';
import { LayoutDashboard, Layers, Bot, Gauge, Cloud, Search, SlidersHorizontal, Server, GitBranch, CreditCard, Bolt, User, TriangleAlert, CircleCheck, Database, Network, Shield, Terminal, ChevronRight, Activity, Menu, Zap } from 'lucide-react-native';
import { useResources, useBilling, useActivities } from '@/hooks/useAzure';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export const DashboardScreen = () => {
  const router = useRouter();
  const { data: resources = [], isLoading: loadingResources, refetch: refetchResources } = useResources();
  const { data: billing, isLoading: loadingBilling } = useBilling();
  const { data: activities = [], isLoading: loadingActivities } = useActivities();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refetchResources();
    setIsRefreshing(false);
  };

  const totalResources = resources.filter((r: any) => r.type !== 'Resource Group').length;
  const totalGroups = resources.filter((r: any) => r.type === 'Resource Group').length;
  const totalCost = billing?.properties?.rows?.[0]?.[0] || 0;
  const formattedCost = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalCost);

  const activityIcons: Record<string, any> = {
    'Write': Bolt,
    'Delete': TriangleAlert,
    'Action': Zap,
    'default': Activity
  };

  const getStatusColor = (level: string) => {
    if (level === 'Error' || level === 'Critical') return '#ba1a1a';
    if (level === 'Warning') return '#623200';
    return '#904d00';
  };

  const dashboardActivities = activities.slice(0, 3).map((a: any) => ({
    title: a.operationName?.localizedValue || a.operationName?.value || 'System Event',
    desc: a.summary || `Resource operation triggered in ${a.resourceGroupName || 'global'} scope.`,
    time: a.eventTimestamp ? new Date(a.eventTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
    level: a.level,
    icon: activityIcons[a.operationName?.value?.split('/')?.pop()] || activityIcons.default
  }));

  return (
    <View className="flex-1 bg-surface font-body text-on-surface">
      {/* TopAppBar */}
      <View className="sticky top-0 z-50 w-full bg-surface-container-lowest border-b border-outline-variant/10 shadow-sm px-6 pt-14 pb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          <View className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/20">
            <Image source={{ uri: 'https://lh3.googleusercontent.com/a/default-user' }} className="w-full h-full" />
          </View>
          <Text className="text-xl font-extrabold text-on-surface tracking-tight font-headline">Azure Kinetic</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 flex items-center justify-center rounded-md active:scale-95 transition-all">
          <Menu size={24} color="#f35325" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#904d00" />}
      >
        {/* Hero Section: Subscription Health */}
        <View className="px-6 py-8">
          <Text className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">SYSTEM OVERVIEW</Text>
          <Text className="text-4xl font-extrabold tracking-tight text-on-surface mb-4">Subscription Intelligence</Text>
          
          <View className="flex-row flex-wrap gap-2 mb-6">
            <View className="px-2.5 py-1 rounded-md bg-secondary-container">
              <Text className="text-xs font-medium text-on-secondary-container uppercase">Active Context</Text>
            </View>
            <View className="px-2.5 py-1 rounded-md bg-tertiary-container/10">
              <Text className="text-xs font-medium text-primary uppercase">Portal Sync: Real-time</Text>
            </View>
          </View>

          {/* Health Status Card */}
          <View className="bg-surface-container-lowest p-6 rounded-md border border-outline-variant/20 shadow-kinetic relative overflow-hidden">
            <View className="absolute top-0 right-0 p-2 opacity-10">
               <CircleCheck size={64} color="#ff8c00" strokeWidth={1} />
            </View>
            <View className="relative z-10">
              <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Health Status</Text>
              <View className="flex-row items-center gap-3">
                <View className="w-3 h-3 bg-primary-container rounded-full shadow-[0_0_8px_#ff8c00]" />
                <Text className="text-2xl font-bold text-on-surface">{resources.length > 0 ? 'Optimal' : 'Disconnected'}</Text>
              </View>
              <Text className="text-sm text-on-surface-variant mt-2">
                {resources.length > 0 
                  ? `Monitoring ${totalResources} active nodes across your infrastructure.`
                  : 'Establish clinical link with Azure Cloud to see infrastructure signals.'
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Summary Cards Grid */}
        <View className="px-6 gap-6 mb-12">
          {/* Total Resources */}
          <View className="bg-surface-container-lowest p-6 rounded-md border-l-4 border-primary shadow-kinetic">
             <View className="flex-row justify-between items-start mb-4">
                <View className="bg-orange-50 p-2 rounded-lg">
                   <Server size={18} color="#904d00" />
                </View>
             </View>
             <Text className="text-sm font-medium text-on-surface-variant mb-1">Total Resources</Text>
             <Text className="text-3xl font-extrabold text-on-surface mb-2">{totalResources}</Text>
             <View className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
                <View className="bg-primary-container h-full w-[100%]" />
             </View>
          </View>

          {/* Active Resource Groups */}
          <View className="bg-surface-container-lowest p-6 rounded-md border-l-4 border-primary shadow-kinetic">
             <View className="flex-row justify-between items-start mb-4">
                <View className="bg-orange-50 p-2 rounded-lg">
                   <GitBranch size={18} color="#904d00" />
                </View>
             </View>
             <Text className="text-sm font-medium text-on-surface-variant mb-1">Active Groups</Text>
             <Text className="text-3xl font-extrabold text-on-surface mb-2">{totalGroups}</Text>
          </View>

          {/* Recent Costs */}
          <View className="bg-surface-container-lowest p-6 rounded-md border-l-4 border-primary shadow-kinetic">
             <View className="flex-row justify-between items-start mb-4">
                <View className="bg-orange-50 p-2 rounded-lg">
                   <CreditCard size={18} color="#904d00" />
                </View>
             </View>
             <Text className="text-sm font-medium text-on-surface-variant mb-1">Recent Costs (MTD)</Text>
             <Text className="text-3xl font-extrabold text-on-surface mb-2">{formattedCost}</Text>
             <Text className="text-xs text-on-surface-variant">
               {billing ? 'Live billing data synced.' : 'Cost data unavailable for this offer.'}
             </Text>
          </View>
        </View>

        {/* Activity Logs */}
        <View className="px-6 mb-12">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center gap-2">
               <View className="bg-orange-50 p-1.5 rounded-lg">
                 <Terminal size={18} color="#904d00" />
               </View>
               <Text className="text-xl font-bold text-on-surface">Recent Activity Logs</Text>
            </View>
          </View>
          
          <View className="gap-3">
             {dashboardActivities.length === 0 ? (
               <View className="py-10 items-center justify-center bg-surface-container-lowest rounded-md border border-outline-variant/10">
                 <Text className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest">No recent operations detected</Text>
               </View>
             ) : (
               dashboardActivities.map((item: any, i: number) => (
                <TouchableOpacity key={i} className="bg-surface-container-lowest p-4 rounded-md border border-outline-variant/10 flex-row items-center gap-4 active:bg-orange-50/30 transition-all">
                   <View className={`w-10 h-10 rounded-lg bg-surface-container items-center justify-center`}>
                     <item.icon size={18} color={getStatusColor(item.level)} />
                   </View>
                   <View className="flex-1">
                     <View className="flex-row justify-between items-start">
                       <Text className="text-sm font-bold text-on-surface" numberOfLines={1}>{item.title}</Text>
                       <Text className="text-[10px] text-on-surface-variant uppercase font-bold">{item.time}</Text>
                     </View>
                     <Text className="text-xs text-on-surface-variant mt-0.5" numberOfLines={2}>{item.desc}</Text>
                   </View>
                   <ChevronRight size={16} color="#cbd5e1" />
                </TouchableOpacity>
              ))
             )}
          </View>
        </View>

        {/* Quick Navigation Overlay */}
        <View className="px-6 mb-8">
           <Text className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4">Quick Navigation</Text>
           <View className="flex-row flex-wrap gap-3">
              {[
                { label: 'Databases', icon: Database },
                { label: 'Networking', icon: Network },
                { label: 'Security', icon: Shield },
                { label: 'Cloud Shell', icon: Terminal },
              ].map((item, i) => (
                <TouchableOpacity key={i} className="flex-1 min-w-[45%] flex-col items-center justify-center p-4 bg-surface-container-lowest border border-outline-variant/10 rounded-md active:bg-orange-50 transition-all">
                  <item.icon size={24} color="#904d00" className="mb-2" />
                  <Text className="text-xs font-semibold">{item.label}</Text>
                </TouchableOpacity>
              ))}
           </View>
        </View>

        {/* AI Optimizer Card */}
        <View className="px-6">
           <View className="bg-gradient-to-br from-orange-600 to-orange-400 p-[1.5px] rounded-md shadow-premium">
              <View className="bg-surface-container-lowest rounded-[6px] p-6">
                 <View className="flex-row items-center gap-2 mb-4">
                    <Bot size={20} color="#904d00" />
                    <Text className="text-sm font-bold uppercase tracking-wider">AI Optimizer</Text>
                 </View>
                 <Text className="text-sm text-on-surface leading-relaxed mb-4">
                    "I've identified <Text className="font-bold text-primary">3 orphaned disks</Text> in your dev environment. Deleting them would save <Text className="font-bold text-primary">$120/mo</Text>."
                 </Text>
                 <TouchableOpacity className="w-full py-3.5 bg-primary rounded-md shadow-sm active:scale-95 transition-all items-center justify-center">
                    <Text className="text-white text-xs font-bold uppercase tracking-widest">Execute Recommendation</Text>
                 </TouchableOpacity>
              </View>
           </View>
        </View>
      </ScrollView>

      {/* Visual Floating Elements (Asymmetry) */}
      <View className="absolute top-1/4 -right-12 w-24 h-64 bg-orange-100/20 rounded-full pointer-events-none -z-10" />
      <View className="absolute bottom-1/4 -left-12 w-32 h-64 bg-blue-100/10 rounded-full pointer-events-none -z-10" />
    </View>
  );
};

