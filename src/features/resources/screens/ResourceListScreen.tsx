import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, ScrollView } from 'react-native';
import { Server, Database, Box, Plus, Pencil, Trash2, RefreshCcw, Search, SlidersHorizontal, Layers, Zap, Info, ChevronRight, Activity, GitBranch } from 'lucide-react-native';
import { ResourceFormSheet } from '../components/ResourceFormSheet';
import { DeleteConfirmationModal } from '@/components/common/DeleteConfirmationModal';
import { useResources, useDeleteResource } from '@/hooks/useAzure';

export const ResourceListScreen = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'apps' | 'blobs' | 'functions'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: resources = [], isLoading, refetch } = useResources();
  const deleteMutation = useDeleteResource();
  
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any>(null);

  const filteredResources = resources.filter((r: any) => {
    const matchesTab = activeTab === 'all' 
      || (activeTab === 'apps' && r.type === 'sites' && r.kind?.includes('app'))
      || (activeTab === 'functions' && r.kind?.includes('functionapp'))
      || (activeTab === 'blobs' && r.type === 'storageaccounts');
    
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase())
      || r.type.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getResourceIcon = (type: string) => {
    if (type.includes('site')) return <Layers size={20} color="#904d00" />;
    if (type.includes('storage')) return <Database size={20} color="#00658f" />;
    if (type.includes('function')) return <Zap size={20} color="#ff8c00" />;
    return <Box size={20} color="#515f74" />;
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
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-14 pb-8 bg-surface-container-lowest border-b border-outline-variant/10 shadow-sm">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-4xl font-extrabold tracking-tight text-on-surface font-headline">Resources</Text>
          <TouchableOpacity 
            onPress={() => refetch()} 
            className="w-10 h-10 rounded-md bg-surface-container flex items-center justify-center active:scale-90 transition-all"
          >
            <RefreshCcw size={20} color="#904d00" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Recessed Search Bar */}
        <View className="flex-row items-center bg-surface-container-highest px-4 py-3 rounded-md mb-8 border border-transparent">
          <Search size={18} color="#564334" opacity={0.5} className="mr-3" />
          <TextInput 
            className="flex-1 text-sm font-medium text-on-surface"
            placeholder="Search nodes, types, regions..."
            placeholderTextColor="#56433480"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity className="p-1">
             <SlidersHorizontal size={18} color="#904d00" />
          </TouchableOpacity>
        </View>

        {/* 2x2 Filter Grid */}
        <View className="gap-3">
          <View className="flex-row gap-3">
            {[
              { id: 'all', label: 'All Resources', icon: Layers },
              { id: 'apps', label: 'Compute', icon: Server },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex-row items-center gap-3 p-4 rounded-md border ${activeTab === tab.id ? 'bg-primary-fixed border-primary' : 'bg-surface-container border-outline-variant/10'}`}
              >
                <tab.icon size={18} color={activeTab === tab.id ? '#904d00' : '#564334'} />
                <Text className={`text-xs font-bold uppercase tracking-widest ${activeTab === tab.id ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View className="flex-row gap-3">
            {[
              { id: 'blobs', label: 'Storage', icon: Database },
              { id: 'functions', label: 'Serverless', icon: Zap },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex-row items-center gap-3 p-4 rounded-md border ${activeTab === tab.id ? 'bg-primary-fixed border-primary' : 'bg-surface-container border-outline-variant/10'}`}
              >
                <tab.icon size={18} color={activeTab === tab.id ? '#904d00' : '#564334'} />
                <Text className={`text-xs font-bold uppercase tracking-widest ${activeTab === tab.id ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* List */}
      {isLoading && resources.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#904d00" size="large" />
        </View>
      ) : (
        <FlatList
          data={filteredResources}
          keyExtractor={(item) => item.id}
          className="flex-1"
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#904d00" />
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              className="mb-4 bg-surface-container-lowest rounded-md shadow-kinetic border border-outline-variant/10 overflow-hidden flex-row active:bg-surface-container-low transition-all"
              onPress={() => handleEdit(item)}
            >
              {/* Status Blade */}
              <View className="w-1.5 bg-primary-container" />
              
              <View className="flex-1 p-5 flex-row items-center">
                <View className="w-12 h-12 rounded-md bg-surface-container flex items-center justify-center mr-4">
                  {getResourceIcon(item.type)}
                </View>
                
                <View className="flex-1">
                   <Text className="text-sm font-bold text-on-surface mb-0.5" numberOfLines={1}>{item.name}</Text>
                   <View className="flex-row items-center gap-2">
                      <Text className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-tighter">
                        {item.location}
                      </Text>
                      <View className="w-1 h-1 rounded-full bg-outline-variant/30" />
                      <Text className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                         {item.type.split('/').pop()}
                      </Text>
                   </View>
                </View>

                <View className="flex-row items-center gap-2">
                  <TouchableOpacity 
                    onPress={() => handleDeletePress(item)} 
                    className="p-2 rounded-md bg-error-container/20 active:bg-error-container/40"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 size={16} color="#ba1a1a" />
                  </TouchableOpacity>
                  <ChevronRight size={18} color="#e0e3e5" />
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="py-20 items-center justify-center">
              <View className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
                 <Layers size={24} color="#564334" opacity={0.2} />
              </View>
              <Text className="text-xs font-bold text-on-surface-variant uppercase tracking-widest text-center opacity-40">
                No Kinetic nodes detected in current scope
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity 
        onPress={handleAdd}
        className="absolute bottom-6 right-6 w-16 h-16 rounded-full bg-primary items-center justify-center shadow-xl shadow-orange-900/40 active:scale-95 transition-all"
      >
        <Plus size={32} color="white" />
      </TouchableOpacity>

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

