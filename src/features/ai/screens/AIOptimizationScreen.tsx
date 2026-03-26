import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { analyzeBilling } from '../services/aiInsightService';
import { TriangleAlert, Ghost, Sparkles, TrendingDown, ArrowRight, Zap, Target, ShieldCheck } from 'lucide-react-native';
import { useBilling, useResources } from '@/hooks/useAzure';
import { LinearGradient } from 'expo-linear-gradient';

export const AIOptimizationScreen = () => {
  const { data: billing, isLoading: loadingBilling } = useBilling();
  const { data: resources = [], isLoading: loadingResources } = useResources();

  const analysis = useMemo(() => {
    if (!billing || !resources.length) return null;
    return analyzeBilling(billing, resources);
  }, [billing, resources]);

  const loading = loadingBilling || loadingResources;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#904d00" />
        <Text className="mt-4 text-sm font-bold text-primary uppercase tracking-widest">Analyzing Cloud Matrix...</Text>
      </View>
    );
  }

  if (!analysis) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-10">
        <View className="w-20 h-20 rounded-full bg-slate-50 items-center justify-center mb-6">
           <Sparkles size={40} color="#e0e3e5" />
        </View>
        <Text className="text-center text-sm font-bold text-on-surface-variant uppercase tracking-widest">
           No signals detected for optimization yet
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Header */}
      <View className="px-6 pt-16 pb-8 bg-white border-b border-orange-50/10">
        <View className="flex-row items-center gap-3 mb-2">
           <Sparkles size={24} color="#904d00" />
           <Text className="text-[10px] font-bold text-primary uppercase tracking-[3px]">Kinetic Engine</Text>
        </View>
        <Text className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">AI Optimization</Text>
        <Text className="text-sm font-medium text-on-surface-variant leading-relaxed">
          Autonomous analysis of your infrastructure efficiency and billing patterns.
        </Text>
      </View>

      <View className="p-6">
        {/* Summary Card */}
        <LinearGradient
          colors={['#904d00', '#ff8c00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-3xl p-6 shadow-xl shadow-orange-900/30 mb-8"
        >
          <View className="flex-row items-center gap-4">
             <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center">
                <TrendingDown size={28} color="white" />
             </View>
             <View>
                <Text className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">Potential Monthly Savings</Text>
                <Text className="text-3xl font-extrabold text-white">{analysis.totalOptimizable}</Text>
             </View>
          </View>
          
          <View className="mt-6 flex-row items-center justify-between border-t border-white/10 pt-4">
            <View className="flex-row items-center gap-2">
               <Target size={14} color="white" />
               <Text className="text-[10px] font-bold text-white uppercase tracking-tighter">Efficiency Target: 94%</Text>
            </View>
            <TouchableOpacity className="bg-white px-4 py-2 rounded-xl">
               <Text className="text-[10px] font-bold text-primary">APPLY ALL</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Alerts Section */}
        <View className="mb-8">
           <View className="flex-row items-center gap-2 mb-4">
              <View className="w-1.5 h-1.5 rounded-full bg-error" />
              <Text className="text-[10px] font-bold text-error uppercase tracking-widest">Over-billing Alerts</Text>
           </View>
           
           {analysis.overbilling.length === 0 ? (
               <View className="bg-white p-6 rounded-2xl border border-outline-variant/5 items-center">
                  <ShieldCheck size={24} color="#4ade80" />
                  <Text className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-tight">No anomalies detected</Text>
               </View>
           ) : (
               analysis.overbilling.map((item: any) => (
                 <View key={item.id} className="mb-4 bg-white rounded-2xl border border-outline-variant/10 overflow-hidden flex-row shadow-sm">
                   <View className="w-1.5 bg-error" />
                   <View className="flex-1 p-5">
                      <View className="flex-row justify-between items-start mb-2">
                         <View className="flex-row items-center gap-2 flex-1">
                            <TriangleAlert size={16} color="#ba1a1a" />
                            <Text className="text-sm font-bold text-on-surface" numberOfLines={1}>{item.name}</Text>
                         </View>
                         <Text className="text-sm font-bold text-error ml-2">{item.cost}</Text>
                      </View>
                      <Text className="text-xs font-medium text-on-surface-variant leading-relaxed">
                        {item.reason}
                      </Text>
                      <TouchableOpacity className="mt-4 flex-row items-center gap-1">
                         <Text className="text-[10px] font-bold text-primary uppercase">Optimize Resource</Text>
                         <ArrowRight size={10} color="#904d00" />
                      </TouchableOpacity>
                   </View>
                 </View>
               ))
           )}
        </View>

        {/* Zombie Resources Section */}
        <View>
           <View className="flex-row items-center gap-2 mb-4">
              <View className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Idle Nodes Detected</Text>
           </View>
           
           {analysis.zombieResources.length === 0 ? (
                <View className="bg-white p-6 rounded-2xl border border-outline-variant/5 items-center">
                   <Text className="text-xs font-bold text-slate-400 uppercase tracking-tight">Infrastructure sequence optimal</Text>
                </View>
           ) : (
               analysis.zombieResources.map((item: any) => (
                 <View key={item.id} className="mb-4 bg-white rounded-2xl border border-outline-variant/10 overflow-hidden flex-row shadow-sm">
                   <View className="w-1.5 bg-slate-200" />
                   <View className="flex-1 p-5">
                      <View className="flex-row justify-between items-center mb-3">
                         <View className="flex-row items-center gap-2 flex-1">
                            <Ghost size={16} color="#515f74" />
                            <Text className="text-sm font-bold text-on-surface" numberOfLines={1}>{item.name}</Text>
                         </View>
                         <View className="bg-slate-50 px-2 py-0.5 rounded">
                            <Text className="text-[8px] font-bold text-slate-400 uppercase">{item.type.split('/').pop()}</Text>
                         </View>
                      </View>
                      
                      <View className="flex-row gap-2 mt-2">
                         <TouchableOpacity className="flex-1 bg-orange-50 py-2.5 rounded-xl items-center">
                            <Text className="text-[9px] font-bold text-primary uppercase">Audit Activity</Text>
                         </TouchableOpacity>
                         <TouchableOpacity className="flex-1 bg-slate-50 py-2.5 rounded-xl items-center">
                            <Text className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tighter">Decommission</Text>
                         </TouchableOpacity>
                      </View>
                   </View>
                 </View>
               ))
           )}
        </View>
      </View>
    </ScrollView>
  );
};

