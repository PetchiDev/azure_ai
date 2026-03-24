import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { X, Plus, Info, ChevronDown } from 'lucide-react-native';
import { THEME } from '../../../constants/theme';
import { GlassContainer } from '../../../components/common/GlassContainer';
import { KineticButton } from '../../../components/ui/KineticButton';
import { KineticInput } from '../../../components/ui/KineticInput';
import { useCreateResource } from '../../../hooks/useAzure';

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
    region: 'East US 2',
    environment: 'Production',
    tags: [{ key: 'CostCenter', value: 'INFRA-402' }],
    type: 'apps',
  });

  const [showTypePicker, setShowTypePicker] = useState(false);

  useEffect(() => {
    if (editingResource) {
      setFormData({
        name: editingResource.name || '',
        region: editingResource.region || editingResource.location || 'East US 2',
        environment: editingResource.environment || 'Production',
        tags: editingResource.tags || [{ key: 'CostCenter', value: 'INFRA-402' }],
        type: editingResource.type || 'apps',
      });
    } else {
      setFormData({
        name: '',
        region: 'East US 2',
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
    newTags[index][field] = value;
    setFormData({ ...formData, tags: newTags });
  };

  const handleRemoveTag = (index: number) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    setFormData({ ...formData, tags: newTags });
  };

  const handleSave = async () => {
    try {
      if (editingResource) {
          // Update not fully implemented in useAzure yet
          alert('Update feature is coming soon to real APIs.');
      } else {
          await createMutation.mutateAsync({ type: formData.type, data: formData });
      }
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const typeLabels = {
    apps: 'App Registration',
    blobs: 'Blob Storage',
    functions: 'Function API'
  };

  const loading = createMutation.isPending;

  return (
    <View style={styles.sheetOverlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <GlassContainer intensity={60} style={styles.sheetContainer}>
           <View style={styles.header}>
             <View>
               <Text style={styles.title}>{editingResource ? 'Update' : 'Create'} {typeLabels[formData.type]}</Text>
               <Text style={styles.subtitle}>{editingResource ? 'EDITING RESOURCE' : 'NEW CLOUD INSTANCE'}</Text>
             </View>
             <TouchableOpacity onPress={onClose} style={styles.closeButton}>
               <X color={THEME.colors.onSurfaceVariant} size={24} />
             </TouchableOpacity>
           </View>

           <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
             {!editingResource && (
               <View style={styles.section}>
                 <Text style={styles.sectionTitle}>RESOURCE TYPE</Text>
                 <TouchableOpacity 
                   style={styles.typeSelector} 
                   onPress={() => setShowTypePicker(!showTypePicker)}
                 >
                   <Text style={styles.typeSelectorText}>{typeLabels[formData.type]}</Text>
                   <ChevronDown size={20} color={THEME.colors.primary} />
                 </TouchableOpacity>

                 {showTypePicker && (
                   <View style={styles.typeOptions}>
                     {(['apps', 'blobs', 'functions'] as const).map((t) => (
                       <TouchableOpacity
                         key={t}
                         style={styles.typeOption}
                         onPress={() => {
                           setFormData({ ...formData, type: t });
                           setShowTypePicker(false);
                         }}
                       >
                         <Text style={[
                           styles.typeOptionText,
                           formData.type === t && styles.typeOptionTextActive
                         ]}>{typeLabels[t]}</Text>
                       </TouchableOpacity>
                     ))}
                   </View>
                 )}
               </View>
             )}

             <View style={styles.section}>
               <Text style={styles.sectionTitle}>BASIC CONFIGURATION</Text>
               <View style={styles.fieldContainer}>
                 <Text style={styles.label}>Name</Text>
                 <KineticInput
                   placeholder="e.g. kv-prod-service"
                   value={formData.name}
                   onChangeText={(text) => setFormData({ ...formData, name: text })}
                 />
                 <View style={styles.hintContainer}>
                   <Info size={12} color={THEME.colors.onSurfaceVariant} />
                   <Text style={styles.hint}>Global identifiers must be unique.</Text>
                 </View>
               </View>

               <View style={styles.fieldContainer}>
                 <Text style={styles.label}>Region</Text>
                 <KineticInput
                   placeholder="e.g. East US 2"
                   value={formData.region}
                   onChangeText={(text) => setFormData({ ...formData, region: text })}
                 />
               </View>
             </View>

             <View style={styles.section}>
               <View style={styles.sectionHeader}>
                 <Text style={styles.sectionTitle}>METADATA & TAGS</Text>
                 <TouchableOpacity onPress={handleAddTag} style={styles.addTagButton}>
                   <Plus size={14} color={THEME.colors.primary} />
                   <Text style={styles.addTagText}>Add Tag</Text>
                 </TouchableOpacity>
               </View>

               <View style={styles.fieldContainer}>
                 <Text style={styles.label}>Environment</Text>
                 <View style={styles.envGrid}>
                   {['Production', 'Staging', 'Dev'].map((env) => (
                     <TouchableOpacity
                       key={env}
                       style={[
                         styles.envButton,
                         formData.environment === env && styles.envButtonActive,
                       ]}
                       onPress={() => setFormData({ ...formData, environment: env })}
                     >
                       <Text style={[
                         styles.envButtonText,
                         formData.environment === env && styles.envButtonTextActive
                       ]}>{env}</Text>
                     </TouchableOpacity>
                   ))}
                 </View>
               </View>

               {formData.tags.map((tag, index) => (
                 <View key={index} style={styles.tagRow}>
                   <View style={{ flex: 1 }}>
                      <Text style={styles.tagLabel}>Key</Text>
                      <TextInput
                        style={styles.tagInput}
                        value={tag.key}
                        onChangeText={(text) => handleUpdateTag(index, 'key', text)}
                        placeholderTextColor={THEME.colors.onSurfaceVariant + '80'}
                      />
                   </View>
                   <View style={{ flex: 1 }}>
                      <Text style={styles.tagLabel}>Value</Text>
                      <View style={styles.tagValueContainer}>
                         <TextInput
                           style={[styles.tagInput, { flex: 1 }]}
                           value={tag.value}
                           onChangeText={(text) => handleUpdateTag(index, 'value', text)}
                           placeholderTextColor={THEME.colors.onSurfaceVariant + '80'}
                         />
                         <TouchableOpacity onPress={() => handleRemoveTag(index)} style={styles.removeTagButton}>
                           <X size={16} color={THEME.colors.error} />
                         </TouchableOpacity>
                      </View>
                   </View>
                 </View>
               ))}
             </View>
           </ScrollView>

           <View style={styles.footer}>
             <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={loading}>
               <Text style={styles.cancelButtonText}>Cancel</Text>
             </TouchableOpacity>
             <KineticButton
               title={editingResource ? 'Update' : 'Create'}
               onPress={handleSave}
               variant="primary"
               style={styles.submitButton}
               disabled={loading || !formData.name}
             />
           </View>
           {loading && (
             <View style={styles.loaderOverlay}>
               <ActivityIndicator color={THEME.colors.primary} size="large" />
             </View>
           )}
        </GlassContainer>
     </View>
  );
};

const styles = StyleSheet.create({
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '90%',
    backgroundColor: THEME.colors.surfaceContainerLow,
    padding: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    padding: THEME.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.outlineVariant + '1A',
    backgroundColor: THEME.colors.surface,
  },
  title: {
    fontFamily: THEME.typography.fontFamily,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: THEME.typography.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.onSurfaceVariant,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: THEME.colors.surfaceContainerHighest,
  },
  content: {
    flex: 1,
    padding: THEME.spacing.lg,
  },
  section: {
    marginBottom: THEME.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: THEME.colors.primary,
    letterSpacing: 2,
    marginBottom: THEME.spacing.sm,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceContainerLowest,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.outlineVariant + '33',
  },
  typeSelectorText: {
    ...THEME.typography.body,
    color: THEME.colors.onSurface,
    fontWeight: '600',
  },
  typeOptions: {
    marginTop: THEME.spacing.xs,
    backgroundColor: THEME.colors.surfaceContainerLowest,
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.outlineVariant + '33',
  },
  typeOption: {
    padding: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.outlineVariant + '1A',
  },
  typeOptionText: {
    ...THEME.typography.body,
    color: THEME.colors.onSurfaceVariant,
  },
  typeOptionTextActive: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  addTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.onSurfaceVariant,
  },
  fieldContainer: {
    marginBottom: THEME.spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.onSurface,
    marginBottom: 8,
    marginLeft: 4,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    marginLeft: 4,
  },
  hint: {
    fontSize: 10,
    color: THEME.colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  envGrid: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  envButton: {
    flex: 1,
    height: 36,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.outlineVariant + '33',
    justifyContent: 'center',
    alignItems: 'center',
  },
  envButtonActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primary + '1A',
  },
  envButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.onSurfaceVariant,
  },
  envButtonTextActive: {
    color: THEME.colors.primary,
  },
  tagRow: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  tagLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.onSurfaceVariant,
    marginBottom: 4,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  tagInput: {
    height: 40,
    backgroundColor: THEME.colors.surfaceContainerLowest,
    borderRadius: THEME.borderRadius.lg,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 12,
    borderWidth: 1,
    borderColor: THEME.colors.outlineVariant + '33',
  },
  tagValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeTagButton: {
    padding: 8,
  },
  footer: {
    padding: THEME.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.outlineVariant + '1A',
    backgroundColor: THEME.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: THEME.spacing.md,
  },
  cancelButton: {
    paddingHorizontal: 20,
    height: 48,
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: THEME.colors.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '700',
  },
  submitButton: {
    width: 140,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
});
