import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { THEME } from '../../../constants/theme';
import { KineticCard } from '../../../components/ui/KineticCard';
import { analyzeBilling } from '../services/aiInsightService';
import { AlertTriangle, Ghost, Sparkles, TrendingDown } from 'lucide-react-native';
import { useBilling, useResources } from '../../../hooks/useAzure';

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
      <View style={styles.center}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Analyzing Cloud Infrastructure...</Text>
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={styles.center}>
        <Sparkles size={48} color={THEME.colors.outlineVariant} />
        <Text style={styles.emptyText}>No data available for AI analysis yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Sparkles size={32} color={THEME.colors.primary} />
        <Text style={styles.title}>AI Optimization</Text>
        <Text style={styles.subtitle}>
          Analysis of your Azure infrastructure usage and billing patterns.
        </Text>
      </View>

      <KineticCard variant="highest" style={styles.summaryCard}>
        <TrendingDown size={24} color={THEME.colors.primary} />
        <View style={styles.summaryText}>
          <Text style={styles.summaryLabel}>POTENTIAL MONTHLY SAVINGS</Text>
          <Text style={styles.summaryValue}>{analysis.totalOptimizable}</Text>
        </View>
      </KineticCard>

      <Text style={styles.sectionTitle}>Over-billing Alerts</Text>
      {analysis.overbilling.length === 0 ? (
          <Text style={styles.itemMeta}>No over-billing alerts detected.</Text>
      ) : (
          analysis.overbilling.map((item: any) => (
            <KineticCard key={item.id} hasAccent variant="high" style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <AlertTriangle size={18} color={THEME.colors.error} />
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCost}>{item.cost}</Text>
              </View>
              <Text style={styles.itemReason}>{item.reason}</Text>
            </KineticCard>
          ))
      )}

      <Text style={styles.sectionTitle}>Untagged / Idle Resources</Text>
      {analysis.zombieResources.length === 0 ? (
          <Text style={styles.itemMeta}>Infrastructure is well-organized.</Text>
      ) : (
          analysis.zombieResources.map((item: any) => (
            <KineticCard key={item.id} variant="low" style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Ghost size={18} color={THEME.colors.onSurfaceVariant} />
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemType}>{item.type.split('/').pop()}</Text>
              </View>
              <KineticCard variant="highest" style={styles.actionCard}>
                <TouchableOpacity>
                  <Text style={styles.actionText}>ADD MANAGEMENT TAGS</Text>
                </TouchableOpacity>
              </KineticCard>
            </KineticCard>
          ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    padding: THEME.spacing.xl,
    paddingTop: 60,
  },
  header: {
    marginBottom: THEME.spacing.xl,
  },
  title: {
    ...THEME.typography.h1,
    color: THEME.colors.onSurface,
    marginTop: THEME.spacing.sm,
  },
  subtitle: {
    ...THEME.typography.body,
    color: THEME.colors.onSurfaceVariant,
    fontSize: 14,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: THEME.spacing.lg,
    backgroundColor: THEME.colors.primaryContainer,
    marginBottom: THEME.spacing.xl,
  },
  summaryText: {
    marginLeft: THEME.spacing.md,
  },
  summaryLabel: {
    ...THEME.typography.label,
    color: 'white',
    fontSize: 10,
    opacity: 0.8,
  },
  summaryValue: {
    ...THEME.typography.h1,
    color: 'white',
    fontSize: 28,
  },
  sectionTitle: {
    ...THEME.typography.label,
    color: THEME.colors.primary,
    marginBottom: THEME.spacing.md,
    marginTop: THEME.spacing.sm,
    letterSpacing: 2,
  },
  itemCard: {
    marginBottom: THEME.spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
  },
  itemName: {
    flex: 1,
    ...THEME.typography.body,
    fontWeight: '700',
    color: THEME.colors.onSurface,
    marginLeft: THEME.spacing.sm,
  },
  itemCost: {
    color: THEME.colors.error,
    fontWeight: '700',
    fontSize: 12,
  },
  itemType: {
    fontSize: 10,
    color: THEME.colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  itemReason: {
    fontSize: 13,
    color: THEME.colors.onSurfaceVariant,
    lineHeight: 18,
  },
  itemMeta: {
    fontSize: 12,
    color: THEME.colors.onSurfaceVariant,
    marginBottom: THEME.spacing.md,
  },
  actionCard: {
    marginTop: THEME.spacing.sm,
    padding: THEME.spacing.sm,
    alignItems: 'center',
  },
  actionText: {
    ...THEME.typography.label,
    color: THEME.colors.primary,
    fontSize: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
  },
  loadingText: {
    marginTop: THEME.spacing.md,
    ...THEME.typography.body,
    color: THEME.colors.primary,
  },
  emptyText: {
    marginTop: THEME.spacing.md,
    ...THEME.typography.body,
    color: THEME.colors.onSurfaceVariant,
  },
});
