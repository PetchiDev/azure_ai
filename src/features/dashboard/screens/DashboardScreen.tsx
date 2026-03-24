import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl, ActivityIndicator } from 'react-native';
import { LayoutDashboard, TrendingUp, AlertTriangle, Database, Terminal, AppWindow, ArrowRight } from 'lucide-react-native';
import { THEME } from '../../../constants/theme';
import { KineticCard } from '../../../components/ui/KineticCard';
import { KineticButton } from '../../../components/ui/KineticButton';
import { ResourceFormSheet } from '../../resources/components/ResourceFormSheet';
import { useResources, useBilling, useActivities } from '../../../hooks/useAzure';

const { width } = Dimensions.get('window');

export const DashboardScreen = () => {
  const { data: resources = [], isLoading: loadingResources, refetch: refetchResources } = useResources();
  const { data: billing, isLoading: loadingBilling } = useBilling();
  const { data: activities = [], isLoading: loadingActivities } = useActivities();
  
  const [isFormVisible, setIsFormVisible] = useState(false);

  const appCount = resources.filter((r: any) => r.type === 'applications' || r.type === 'apps').length;
  const storageCount = resources.filter((r: any) => r.type === 'storageaccounts').length;
  const funcCount = resources.filter((r: any) => r.type === 'sites').length;

  const onRefresh = () => {
    refetchResources();
  };

  const loading = loadingResources || loadingBilling || loadingActivities;

  // Transform Billing Data
  const totalCost = billing?.properties?.rows?.[0]?.[0] || 0;
  const formattedCost = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalCost);

  const stats = [
    { label: 'Total Resources', value: resources.length.toString(), change: '+RealTime', color: THEME.colors.primary, icon: LayoutDashboard },
    { label: 'Current Billing', value: formattedCost, change: '↑ Month', color: THEME.colors.error, icon: TrendingUp },
    { label: 'Active Alerts', value: '0', badge: 'Healthy', color: THEME.colors.secondary, icon: AlertTriangle },
    { label: 'Storage Accounts', value: storageCount.toString(), badge: 'Active', color: THEME.colors.secondary, icon: Database },
    { label: 'Function Apps', value: funcCount.toString(), badge: 'Online', color: THEME.colors.tertiary, icon: Terminal },
    { label: 'Resource Map', value: appCount.toString(), badge: 'Secured', color: THEME.colors.primary, icon: AppWindow },
  ];

  // Transform Activities (Limit to 3 for Dashboard)
  const recentActivities = (activities || []).slice(0, 3).map((act: any) => ({
    title: act.operationName?.localizedValue || 'Azure Operation',
    time: new Date(act.eventTimestamp).toLocaleTimeString(),
    user: act.caller || 'System',
    color: act.level === 'Critical' ? THEME.colors.error : THEME.colors.primary,
  }));

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={THEME.colors.primary} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Infrastructure Overview</Text>
            <Text style={styles.subtitle}>Real-time status of your Kinetic Vault ecosystem.</Text>
          </View>
          <KineticButton title="Create Resource" onPress={() => setIsFormVisible(true)} variant="primary" style={styles.headerButton} />
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <View style={styles.statValueContainer}>
                <Text style={styles.statValue}>{stat.value}</Text>
                {stat.badge && (
                  <View style={[styles.badge, { backgroundColor: stat.color + '20' }]}>
                    <Text style={[styles.badgeText, { color: stat.color }]}>{stat.badge}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT ACTIVITY (AZURE MONITOR)</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View Logs</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activityFeed}>
            {loadingActivities && <ActivityIndicator size="small" color={THEME.colors.primary} style={{ margin: 20 }} />}
            <View style={styles.timeline} />
            {recentActivities.map((activity: any, index: number) => (
              <View key={index} style={styles.activityItem}>
                <View style={[styles.activityIconCircle, { backgroundColor: activity.color }]}>
                  <ArrowRight size={14} color="#FFF" />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityMeta}>{activity.time} • {activity.user}</Text>
                </View>
              </View>
            ))}
            {!loadingActivities && recentActivities.length === 0 && (
              <Text style={styles.emptyText}>No recent activities found.</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>REAL-TIME RESOURCE SUMMARY</Text>
          <View style={styles.resourceGrid}>
            <KineticCard style={styles.resourceCard} hasAccent>
                <Database size={24} color={THEME.colors.secondary} />
                <Text style={styles.resourceCardTitle}>Storage</Text>
                <Text style={styles.resourceCardValue}>{storageCount}</Text>
            </KineticCard>
            <KineticCard style={styles.resourceCard} hasAccent>
                <Terminal size={24} color={THEME.colors.tertiary} />
                <Text style={styles.resourceCardTitle}>Functions</Text>
                <Text style={styles.resourceCardValue}>{funcCount}</Text>
            </KineticCard>
          </View>
        </View>
      </ScrollView>

      <ResourceFormSheet 
        isVisible={isFormVisible} 
        onClose={() => setIsFormVisible(false)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.surfaceContainerLow,
  },
  content: {
    padding: THEME.spacing.md,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: THEME.spacing.lg,
  },
  title: {
    fontFamily: THEME.typography.fontFamily,
    fontSize: 24,
    fontWeight: '700',
    color: THEME.colors.onSurface,
  },
  subtitle: {
    fontFamily: THEME.typography.fontFamily,
    fontSize: 14,
    color: THEME.colors.onSurfaceVariant,
    marginTop: 4,
  },
  headerButton: {
    width: 140,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.lg,
  },
  statCard: {
    width: (width - THEME.spacing.md * 2 - THEME.spacing.sm) / 2,
    backgroundColor: THEME.colors.surfaceContainerHigh,
    padding: THEME.spacing.md,
    borderLeftWidth: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  badge: {
     paddingHorizontal: 8,
     paddingVertical: 2,
     borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  section: {
    marginBottom: THEME.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: THEME.colors.onSurface,
    letterSpacing: 1.5,
  },
  viewAll: {
    fontSize: 10,
    fontWeight: 'bold',
    color: THEME.colors.primary,
    textTransform: 'uppercase',
  },
  activityFeed: {
    backgroundColor: THEME.colors.surfaceContainerLowest,
    borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.md,
    position: 'relative',
  },
  timeline: {
    position: 'absolute',
    left: THEME.spacing.md + 15,
    top: THEME.spacing.md + 16,
    bottom: THEME.spacing.md + 16,
    width: 1,
    backgroundColor: THEME.colors.outlineVariant + '33',
  },
  activityItem: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
    zIndex: 1,
  },
  activityIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: THEME.colors.surfaceContainerLowest,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activityMeta: {
    fontSize: 10,
    color: THEME.colors.onSurfaceVariant,
    marginTop: 2,
  },
  resourceGrid: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  resourceCard: {
    flex: 1,
    padding: THEME.spacing.md,
  },
  resourceCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
  },
  resourceCardValue: {
    fontSize: 20,
    fontWeight: '900',
    color: THEME.colors.primary,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 12,
    color: THEME.colors.onSurfaceVariant,
    textAlign: 'center',
    marginVertical: 20,
  },
});
