import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { ArrowLeft, ShoppingCart, Star, Shield, Zap, Info, ChevronRight } from 'lucide-react-native';
import { useRoute } from '@react-navigation/native';
import { useCartStore } from '../../../store/useCartStore';
import { LinearGradient } from 'expo-linear-gradient';


export const ResourceDetailScreen = ({ navigation, route }: { navigation: any; route: any }) => {
  const { resource } = route.params || { 
    resource: { 
      id: 'default', 
      name: 'Kinetic Cloud Node', 
      type: 'Premium Compute', 
      location: 'East US',
      price: 11.00 
    } 
  };

  const { addItem, getTotalItems } = useCartStore();
  const cartItemCount = getTotalItems();

  const handleAddToCart = () => {
    addItem({
      id: resource.id,
      name: resource.name,
      type: resource.type,
      location: resource.location,
      price: resource.price || 11.00,
      quantity: 1,
    });
    alert('Added to cart!');
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-white shadow-sm items-center justify-center border border-outline-variant/10"
        >
          <ArrowLeft size={20} color="#191c1e" />
        </TouchableOpacity>
        
        <View className="flex-row gap-3">
          <TouchableOpacity 
            onPress={() => navigation.navigate('OrderFlow')}
            className="w-10 h-10 rounded-full bg-white shadow-sm items-center justify-center border border-outline-variant/10 relative"
          >
            <ShoppingCart size={20} color="#191c1e" />
            {cartItemCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-primary w-5 h-5 rounded-full items-center justify-center border-2 border-white">
                <Text className="text-[10px] font-bold text-white">{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Resource Image/Visual */}
        <View className="px-6 py-4">
          <View className="h-64 bg-surface-container-high rounded-[32px] overflow-hidden items-center justify-center">
             <LinearGradient
               colors={['#904d0020', '#ff8c0010']}
               className="absolute inset-0"
             />
             <Zap size={80} color="#904d00" opacity={0.2} />
          </View>
        </View>

        {/* Title and Rating */}
        <View className="px-6 py-4">
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1">
              <Text className="text-2xl font-black text-on-surface tracking-tight leading-tight">
                {resource.name}
              </Text>
              <Text className="text-sm font-bold text-primary uppercase tracking-widest mt-1">
                {resource.type}
              </Text>
            </View>
            <View className="bg-orange-50 px-3 py-1.5 rounded-full flex-row items-center gap-1">
              <Star size={12} color="#904d00" fill="#904d00" />
              <Text className="text-xs font-black text-primary">4.9</Text>
            </View>
          </View>

          {/* Pricing Requirement: From $11.00 / 100 g (Example placeholder) */}
          <View className="mt-4 flex-row items-end gap-1">
            <Text className="text-sm font-bold text-on-surface-variant mb-1">From</Text>
            <Text className="text-3xl font-black text-primary tracking-tighter">${resource.price?.toFixed(2) || '11.00'}</Text>
            <Text className="text-sm font-bold text-on-surface-variant mb-1">/ 100 g instance</Text>
          </View>
        </View>

        {/* Features Chips */}
        <View className="px-6 py-2 flex-row flex-wrap gap-2">
           <View className="bg-surface-container-low px-3 py-2 rounded-xl flex-row items-center gap-2">
              <Shield size={14} color="#515f74" />
              <Text className="text-[10px] font-bold text-on-surface-variant uppercase">Enterprise Secure</Text>
           </View>
           <View className="bg-surface-container-low px-3 py-2 rounded-xl flex-row items-center gap-2">
              <Zap size={14} color="#515f74" />
              <Text className="text-[10px] font-bold text-on-surface-variant uppercase">Instant Edge</Text>
           </View>
        </View>

        {/* Long Description Requirement */}
        <View className="px-6 py-8">
          <Text className="text-xs font-black text-primary uppercase tracking-[2px] mb-4">Instance Topology</Text>
          <Text className="text-sm font-medium text-on-surface-variant leading-relaxed">
            The Kinetic Architect Framework provides high-density information architecture that feels effortless. 
            This {resource.name} instance is fully optimized for serverless execution and real-time data streaming. 
            By utilizing Intentional Asymmetry and Tonal Depth, we ensure your cloud resources are managed with 
            mechanical precision. This node is located in {resource.location} and supports auto-scaling 
            based on compute demand.
          </Text>
          
          <TouchableOpacity className="mt-6 flex-row items-center justify-between bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10">
             <View className="flex-row items-center gap-3">
                <Info size={18} color="#904d00" />
                <Text className="text-sm font-bold text-on-surface">View Technical Specs</Text>
             </View>
             <ChevronRight size={18} color="#564334" opacity={0.3} />
          </TouchableOpacity>

          {/* Spacer for bottom button */}
          <View className="h-32" />
        </View>
      </ScrollView>

      {/* Floating Add to Cart Button Requirement */}
      <View className="absolute bottom-10 left-6 right-6">
        <TouchableOpacity 
          onPress={handleAddToCart}
          className="bg-primary h-16 rounded-2xl shadow-xl shadow-orange-900/30 flex-row items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <Text className="text-white font-black text-lg uppercase tracking-widest">Add to Cart</Text>
          <View className="w-1.5 h-1.5 rounded-full bg-white/40" />
          <Text className="text-white/80 font-bold">${resource.price?.toFixed(2) || '11.00'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
