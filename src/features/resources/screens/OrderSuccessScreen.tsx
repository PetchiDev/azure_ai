import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { CircleCheck, ChevronRight, LayoutDashboard, Share2 } from 'lucide-react-native';
import { useCartStore } from '../../../store/useCartStore';


export const OrderSuccessScreen = ({ navigation }: { navigation: any }) => {
  const clearCart = useCartStore(state => state.clearCart);
  
  // Requirement: Show Order Number
  const orderNumber = `KINETIC-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleReturn = () => {
    clearCart();
    navigation.navigate('Dashboard');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-10">
        <View className="w-24 h-24 rounded-full bg-orange-50 items-center justify-center mb-8 shadow-sm">
           <CircleCheck size={48} color="#904d00" strokeWidth={2.5} />
        </View>

        <Text className="text-3xl font-black text-on-surface text-center tracking-tight mb-2">
           Sequence Successful!
        </Text>
        <Text className="text-sm font-medium text-on-surface-variant text-center leading-relaxed opacity-60">
           Your cloud resource provisioning sequence has been initiated and queued for deployment.
        </Text>

        <View className="mt-12 bg-surface-container-low w-full p-6 rounded-[32px] border border-outline-variant/5">
           <View className="items-center">
              <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[3px] mb-2">Order Identification</Text>
              <Text className="text-2xl font-black text-primary tracking-widest">#{orderNumber}</Text>
           </View>
           
           <View className="h-[1px] bg-outline-variant/10 my-6" />
           
           <View className="flex-row justify-between items-center">
              <View>
                 <Text className="text-[10px] font-bold text-on-surface-variant uppercase">Status</Text>
                 <Text className="text-sm font-bold text-green-600">Active</Text>
              </View>
              <TouchableOpacity className="bg-white p-3 rounded-2xl shadow-sm">
                 <Share2 size={18} color="#904d00" />
              </TouchableOpacity>
           </View>
        </View>
      </View>

      <View className="px-6 pb-12">
         <TouchableOpacity 
           onPress={handleReturn}
           className="bg-primary h-16 rounded-2xl flex-row items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-orange-900/20"
         >
           <LayoutDashboard size={20} color="white" />
           <Text className="text-white font-black text-lg uppercase tracking-widest">Return to Dashboard</Text>
           <ChevronRight size={20} color="white" />
         </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
