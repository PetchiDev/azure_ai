import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { X, Plus, Info, ChevronDown, Cpu, Database, Layers, Globe } from 'lucide-react-native';
import { GlassContainer } from '@/components/common/GlassContainer';
import { KineticButton } from '@/components/ui/KineticButton';
import { KineticInput } from '@/components/ui/KineticInput';
import { useCreateResource } from '@/hooks/useAzure';

interface Tag {
  key: string;
  value: string;
}

interface FormData {
  name: string;
  region: string;
  environment: string;
  tags: Tag[];
  type: 'apps' | 'blobs' | 'functions';
}

interface ResourceFormSheetProps {
  isVisible: boolean;
  onClose: () => void;
  editingResource?: any;
}

export const ResourceFormSheet: React.FC<ResourceFormSheetProps> = ({
  isVisible,
  onClose,
  editingResource,
}) => {
  const createMutation = useCreateResource();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    region: 'South India',
    environment: 'Production',
    tags: [{ key: 'CostCenter', value: 'INFRA-402' }],
    type: 'apps',
  });

  const [showTypePicker, setShowTypePicker] = useState(false);

  useEffect(() => {
    if (editingResource) {
      // Azure tags are an object { "key": "value" }, we need Tag[] { key, value }
      const azureTags = editingResource.tags || {};
      const formattedTags: Tag[] = Object.entries(azureTags).map(([key, value]) => ({
        key,
        value: String(value),
      }));

      setFormData({
        name: editingResource.name || '',
        region: editingResource.region || editingResource.location || 'South India',
        environment: editingResource.environment || (azureTags['Environment'] as string) || 'Production',
        tags: formattedTags.length > 0 ? formattedTags : [{ key: 'CostCenter', value: 'INFRA-402' }],
        type: editingResource.type || 'apps',
      });
    } else {
      setFormData({
        name: '',
        region: 'South India',
        environment: 'Production',
        tags: [{ key: 'CostCenter', value: 'INFRA-402' }],
        type: 'apps',
      });
    }
  }, [editingResource, isVisible]);

  if (!isVisible) return null;

  const handleAddTag = () => {
    setFormData({ ...formData, tags: [...formData.tags, { key: '', value: '' }] });
  };

  const handleUpdateTag = (index: number, field: 'key' | 'value', value: string) => {
    const newTags = [...formData.tags];
    (newTags[index] as any)[field] = value;
    setFormData({ ...formData, tags: newTags });
  };

  const handleRemoveTag = (index: number) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    setFormData({ ...formData, tags: newTags });
  };

  const handleSave = async () => {
    try {
      // Convert Tag[] back to Azure object { key: value }
      const tagsObject = formData.tags.reduce((acc, tag) => {
        if (tag.key) acc[tag.key] = tag.value;
        return acc;
      }, {} as Record<string, string>);

      // Add environment tag if not present
      if (formData.environment) {
        tagsObject['Environment'] = formData.environment;
      }

      if (editingResource) {
          alert('Update feature is coming soon to real APIs.');
      } else {
          await createMutation.mutateAsync({ 
            type: formData.type, 
            data: { ...formData, tags: tagsObject } 
          });
      }
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const typeLabels = {
    apps: 'App Service',
    blobs: 'Blob Storage',
    functions: 'Function Node'
  };

  const typeIcons = {
    apps: <Layers size={18} color="#904d00" />,
    blobs: <Database size={18} color="#904d00" />,
    functions: <Cpu size={18} color="#904d00" />
  };

  const loading = createMutation.isPending;

  return (
    <View className="absolute inset-0 z-[1000]">
        <TouchableOpacity 
          className="absolute inset-0 bg-slate-900/60" 
          activeOpacity={1} 
          onPress={onClose} 
        />
        <GlassContainer intensity={90} className="absolute bottom-0 left-0 right-0 h-[92%] bg-white rounded-t-[40px] shadow-2xl">
           <View className="flex-row justify-between items-center px-8 py-6 border-b border-orange-50/10 bg-white/50">
             <View>
               <Text className="text-xl font-bold text-on-surface tracking-tight">
                 {editingResource ? 'Update' : 'Provision'} {typeLabels[formData.type]}
               </Text>
               <Text className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mt-1">
                 {editingResource ? 'Modify Kinetic Instance' : 'New Cloud Sequence'}
               </Text>
             </View>
             <TouchableOpacity onPress={onClose} className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center">
               <X color="#515f74" size={20} />
             </TouchableOpacity>
           </View>

           <ScrollView className="flex-1 px-8 py-6" showsVerticalScrollIndicator={false}>
             {!editingResource && (
               <View className="mb-8">
                 <Text className="text-[10px] font-black text-primary uppercase tracking-[2px] mb-4">Resource Type</Text>
                 <TouchableOpacity 
                   className="flex-row justify-between items-center bg-slate-50 border border-outline-variant/5 p-4 rounded-2xl"
                   onPress={() => setShowTypePicker(!showTypePicker)}
                 >
                    <View className="flex-row items-center gap-3">
                       {typeIcons[formData.type]}
                       <Text className="text-sm font-bold text-on-surface">{typeLabels[formData.type]}</Text>
                    </View>
                    <ChevronDown size={18} color="#904d00" />
                 </TouchableOpacity>

                 {showTypePicker && (
                   <View className="mt-2 bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
                     {(['apps', 'blobs', 'functions'] as const).map((t) => (
                       <TouchableOpacity
                         key={t}
                         className={`flex-row items-center gap-3 p-4 border-b border-slate-50 ${formData.type === t ? 'bg-orange-50/30' : ''}`}
                         onPress={() => {
                           setFormData({ ...formData, type: t });
                           setShowTypePicker(false);
                         }}
                       >
                         {typeIcons[t]}
                         <Text className={`text-sm ${formData.type === t ? 'font-bold text-primary' : 'font-medium text-on-surface-variant'}`}>
                           {typeLabels[t]}
                         </Text>
                       </TouchableOpacity>
                     ))}
                   </View>
                 )}
               </View>
             )}

             <View className="mb-8">
               <Text className="text-[10px] font-black text-primary uppercase tracking-[2px] mb-4">Core Sequence</Text>
               <KineticInput
                 label="Instance Name"
                 placeholder="e.g. kv-prod-cluster"
                 value={formData.name}
                 onChangeText={(text) => setFormData({ ...formData, name: text })}
               />
               <View className="flex-row items-center gap-2 mt-[-8px] mb-4 ml-1 opacity-60">
                 <Info size={10} color="#515f74" />
                 <Text className="text-[10px] font-medium text-on-surface-variant">Global alphanumeric identifiers only.</Text>
               </View>

               <View className="flex-row gap-4">
                  <View className="flex-1">
                     <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 ml-1">Primary Region</Text>
                     <TouchableOpacity className="bg-slate-50 border border-outline-variant/5 p-4 rounded-2xl flex-row justify-between items-center">
                        <View className="flex-row items-center gap-2">
                           <Globe size={14} color="#515f74" />
                           <Text className="text-sm font-bold text-on-surface">{formData.region}</Text>
                        </View>
                        <ChevronDown size={14} color="#515f74" />
                     </TouchableOpacity>
                  </View>
               </View>
             </View>

             <View className="mb-10">
               <View className="flex-row justify-between items-center mb-4">
                 <Text className="text-[10px] font-black text-primary uppercase tracking-[2px]">Matrix Tags</Text>
                 <TouchableOpacity onPress={handleAddTag} className="flex-row items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-full">
                   <Plus size={12} color="#904d00" />
                   <Text className="text-[9px] font-bold text-primary uppercase">Add Node</Text>
                 </TouchableOpacity>
               </View>

               <View className="mb-6">
                 <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3 ml-1">Environment Stage</Text>
                 <View className="flex-row gap-2">
                   {['Production', 'Staging', 'Dev'].map((env) => (
                     <TouchableOpacity
                       key={env}
                       className={`flex-1 py-3 rounded-xl border items-center ${formData.environment === env ? 'bg-primary border-primary' : 'bg-white border-outline-variant/10'}`}
                       onPress={() => setFormData({ ...formData, environment: env })}
                     >
                       <Text className={`text-[10px] font-extrabold uppercase tracking-tighter ${formData.environment === env ? 'text-white' : 'text-on-surface-variant'}`}>
                         {env}
                       </Text>
                     </TouchableOpacity>
                   ))}
                 </View>
               </View>

               {(formData.tags || []).map((tag, index) => (
                 <View key={index} className="flex-row gap-3 mb-4 bg-slate-50/50 p-4 rounded-2xl border border-outline-variant/5">
                   <View className="flex-1">
                      <Text className="text-[8px] font-bold text-slate-400 uppercase mb-1">Key</Text>
                      <TextInput
                        className="text-xs font-bold text-on-surface"
                        value={tag.key}
                        onChangeText={(text) => handleUpdateTag(index, 'key', text)}
                        placeholder="Tag Key"
                        placeholderTextColor="#515f7433"
                      />
                   </View>
                   <View className="flex-1 border-l border-slate-200 pl-3">
                      <Text className="text-[8px] font-bold text-slate-400 uppercase mb-1">Value</Text>
                      <View className="flex-row items-center justify-between">
                         <TextInput
                           className="text-xs font-bold text-primary flex-1"
                           value={tag.value}
                           onChangeText={(text) => handleUpdateTag(index, 'value', text)}
                           placeholder="Tag Value"
                           placeholderTextColor="#904d0033"
                         />
                         <TouchableOpacity onPress={() => handleRemoveTag(index)} className="p-1">
                           <X size={14} color="#ba1a1a" />
                         </TouchableOpacity>
                      </View>
                   </View>
                 </View>
               ))}
             </View>
           </ScrollView>

           <View className="px-8 pt-4 pb-10 bg-white border-t border-orange-50/10 flex-row items-center gap-4">
              <TouchableOpacity 
                className="flex-1 bg-slate-50 py-4 rounded-2xl items-center" 
                onPress={onClose} 
                disabled={loading}
              >
                <Text className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Cancel</Text>
              </TouchableOpacity>
              
              <View className="flex-[1.5]">
                 <KineticButton
                   title={editingResource ? 'Update Instance' : 'Execute Sequence'}
                   onPress={handleSave}
                   variant="primary"
                   disabled={loading || !formData.name}
                 />
              </View>
           </View>

           {loading && (
             <View className="absolute inset-0 bg-white/60 items-center justify-center z-[2000] backdrop-blur-sm">
                <View className="bg-white p-6 rounded-3xl shadow-xl items-center gap-3">
                   <ActivityIndicator color="#904d00" size="large" />
                   <Text className="text-[10px] font-bold text-primary uppercase tracking-[3px]">Provisioning...</Text>
                </View>
             </View>
           )}
        </GlassContainer>
    </View>
  );
};
