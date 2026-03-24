import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { THEME } from '../../../constants/theme';
import { KineticCard } from '../../../components/ui/KineticCard';
import { Box, Layers, Database, Cpu, Plus, Pencil, Trash2, RefreshCcw } from 'lucide-react-native';
import { ResourceFormSheet } from '../components/ResourceFormSheet';
import { DeleteConfirmationModal } from '../../../components/common/DeleteConfirmationModal';
import { useResources, useDeleteResource } from '../../../hooks/useAzure';

const ICON_SIZE = 20;

export const ResourceListScreen = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'apps' | 'blobs' | 'functions'>('all');
  const { data: resources = [], isLoading, refetch } = useResources();
  const deleteMutation = useDeleteResource();
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any>(null);

  const filteredResources = activeTab === 'all' 
    ? resources 
    : resources.filter((r: any) => {
        if (activeTab === 'apps') return r.type === 'sites' && r.kind?.includes('app');
        if (activeTab === 'functions') return r.kind?.includes('functionapp');
        if (activeTab === 'blobs') return r.type === 'storageaccounts';
        return false;
      });

  const renderIcon = (type: string) => {
    if (type.includes('site')) return <Layers size={ICON_SIZE} color={THEME.colors.primary} />;
    if (type.includes('storage')) return <Database size={ICON_SIZE} color={THEME.colors.secondary} />;
    return <Box size={ICON_SIZE} color={THEME.colors.tertiary} />;
  };

  const handleAdd = () => {
    setSelectedResource(null);
    setIsFormVisible(true);
  };

  const handleEdit = (resource: any) => {
    setSelectedResource(resource);
    setIsFormVisible(true);
  };

  const handleDeletePress = (resource: any) => {
    setSelectedResource(resource);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (selectedResource) {
      await deleteMutation.mutateAsync(selectedResource.id);
      setIsDeleteModalVisible(false);
      setSelectedResource(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Resources</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => refetch()} style={styles.iconButton}>
              <RefreshCcw size={20} color={THEME.colors.onSurface} strokeWidth={2.5} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
              <Plus size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.tabs}>
          {['all', 'apps', 'blobs', 'functions'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab as any)}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading && resources.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={THEME.colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredResources}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={THEME.colors.primary} />
          }
          renderItem={({ item }) => (
            <KineticCard hasAccent variant="high" style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  {renderIcon(item.type)}
                </View>
                <View style={styles.info}>
                  <Text style={styles.resourceName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.resourceMeta}>{item.location} • {item.type}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
                    <Pencil size={16} color={THEME.colors.onSurfaceVariant} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleDeletePress(item)} 
                    style={styles.actionButton}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending && selectedResource?.id === item.id ? (
                        <ActivityIndicator size="small" color={THEME.colors.error} />
                    ) : (
                        <Trash2 size={16} color={THEME.colors.error} />
                    )}
                  </TouchableOpacity>
                  <View style={styles.statusHealthy} />
                </View>
              </View>
            </KineticCard>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No real resources found in this subscription.</Text>
            </View>
          }
        />
      )}

      <ResourceFormSheet
        isVisible={isFormVisible}
        onClose={() => setIsFormVisible(false)}
        editingResource={selectedResource}
      />

      <DeleteConfirmationModal
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        description="Are you sure you want to delete this resource?"
        resourceName={selectedResource?.name || ''}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    padding: THEME.spacing.xl,
    paddingTop: 60,
    backgroundColor: THEME.colors.surfaceContainerLowest,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
  },
  title: {
    ...THEME.typography.h1,
    color: THEME.colors.onSurface,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  iconButton: {
    padding: THEME.spacing.xs,
  },
  tabs: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.surfaceContainer,
  },
  activeTab: {
    backgroundColor: THEME.colors.primary,
  },
  tabText: {
    ...THEME.typography.label,
    fontSize: 10,
    color: THEME.colors.onSurfaceVariant,
  },
  activeTabText: {
    color: 'white',
  },
  list: {
    padding: THEME.spacing.md,
  },
  card: {
    marginBottom: THEME.spacing.sm,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.md,
  },
  info: {
    flex: 1,
  },
  resourceName: {
    ...THEME.typography.body,
    fontWeight: '600',
    color: THEME.colors.onSurface,
  },
  resourceMeta: {
    fontSize: 12,
    color: THEME.colors.onSurfaceVariant,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  actionButton: {
    padding: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.surfaceContainerLow,
  },
  statusHealthy: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
    marginLeft: THEME.spacing.xs,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: THEME.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...THEME.typography.body,
    color: THEME.colors.onSurfaceVariant,
    fontSize: 12,
    textAlign: 'center',
  },
});
