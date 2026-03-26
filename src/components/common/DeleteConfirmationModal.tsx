import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { TriangleAlert, X } from 'lucide-react-native';
import { KineticButton } from '../ui/KineticButton';

interface DeleteConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  resourceName: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  resourceName,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-slate-900/90 justify-center items-center px-10">
        <View className="w-full max-w-[400px] bg-white rounded-[32px] overflow-hidden shadow-2xl border border-outline-variant/5">
          <View className="p-8 items-center justify-center relative">
            <View className="w-20 h-20 rounded-full bg-red-50 items-center justify-center mb-6">
              <TriangleAlert size={40} color="#ba1a1a" />
            </View>
            <TouchableOpacity onPress={onClose} className="absolute right-6 top-6 p-2 rounded-full bg-slate-50">
              <X size={18} color="#515f74" />
            </TouchableOpacity>
            
            <Text className="text-2xl font-bold text-on-surface text-center mb-2">{title}</Text>
            <Text className="text-sm font-medium text-on-surface-variant text-center leading-relaxed">
              {description}
            </Text>
            <View className="mt-4 bg-slate-50 px-4 py-2 rounded-xl">
               <Text className="text-xs font-bold text-slate-500 font-mono tracking-tighter">{resourceName}</Text>
            </View>
            
            <View className="w-full mt-8 flex-row gap-3">
              <TouchableOpacity 
                onPress={onClose} 
                className="flex-1 h-14 bg-slate-100 rounded-2xl justify-center items-center active:bg-slate-200"
              >
                <Text className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Abort</Text>
              </TouchableOpacity>
              <View className="flex-[1.5]">
                 <KineticButton
                   title="Erase Node"
                   onPress={onConfirm}
                   variant="primary"
                   style={{ backgroundColor: '#ba1a1a' } as any}
                 />
              </View>
            </View>
            
            <Text className="mt-6 text-[10px] font-bold text-error uppercase tracking-widest opacity-40">IRREVERSIBLE SEQUENCE</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};
