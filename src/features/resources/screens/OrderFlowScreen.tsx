import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Platform } from 'react-native';
import { ArrowLeft, X, MapPin, Calendar, CreditCard, ChevronRight, Check, Plus, Minus, Ticket, Edit3, Zap } from 'lucide-react-native';

import { useCartStore } from '../../../store/useCartStore';


type OrderStep = 1 | 2 | 3 | 4;

export const OrderFlowScreen = ({ navigation }: { navigation: any }) => {
  const [currentStep, setCurrentStep] = useState<OrderStep>(1);
  const { items, updateQuantity, getTotalPrice } = useCartStore();
  const total = getTotalPrice();

  const STEPS = [
    { id: 1, name: 'Address' },
    { id: 2, name: 'Schedule' },
    { id: 3, name: 'Payment' },
    { id: 4, name: 'Confirm your order' },
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as OrderStep);
    } else {
      navigation.navigate('OrderSuccess');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as OrderStep);
    } else {
      navigation.goBack();
    }
  };

  const renderProgressBar = () => (
    <View className="flex-row items-center justify-between px-6 py-4 bg-white">
      {STEPS.map((step, index) => (
        <React.Fragment key={step.id}>
          <View className="items-center">
            <View className={`w-8 h-8 rounded-full items-center justify-center ${currentStep >= step.id ? 'bg-primary' : 'bg-surface-container'}`}>
              {currentStep > step.id ? (
                <Check size={14} color="white" />
              ) : (
                <Text className={`text-xs font-bold ${currentStep >= step.id ? 'text-white' : 'text-on-surface-variant'}`}>
                  {step.id}
                </Text>
              )}
            </View>
          </View>
          {index < STEPS.length - 1 && (
            <View className={`flex-1 h-[2px] mx-2 ${currentStep > step.id ? 'bg-primary' : 'bg-surface-container'}`} />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  const renderStepHeader = () => (
    <View className="px-6 py-6 bg-white border-b border-outline-variant/10">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-4">
           {/* Requirement: Large Back and X icons */}
           <TouchableOpacity onPress={handleBack}>
              <ArrowLeft size={28} color="#191c1e" strokeWidth={2.5} />
           </TouchableOpacity>
           <TouchableOpacity onPress={() => navigation.goBack()}>
              <X size={28} color="#191c1e" strokeWidth={2.5} />
           </TouchableOpacity>
        </View>
        <Text className="text-sm font-black text-primary uppercase tracking-[2px]">Step {currentStep} of 4</Text>
      </View>
      <Text className="text-3xl font-black text-on-surface tracking-tight">
        {STEPS.find(s => s.id === currentStep)?.name}
      </Text>
    </View>
  );

  const renderAddressStep = () => (
    <ScrollView className="flex-1 px-6 py-8">
      <TouchableOpacity className="bg-surface-container-low p-6 rounded-[24px] border border-primary flex-row items-start gap-4 mb-6">
        <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center">
           <MapPin size={24} color="#904d00" />
        </View>
        <View className="flex-1">
           <Text className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Office Hub</Text>
           <Text className="text-base font-bold text-on-surface">123 Kinetic Way</Text>
           <Text className="text-sm font-medium text-on-surface-variant">Chennai, TN 600001</Text>
        </View>
        <Check size={20} color="#904d00" />
      </TouchableOpacity>
      
      <TouchableOpacity className="bg-white p-6 rounded-[24px] border border-outline-variant/10 flex-row items-center gap-4">
        <View className="w-12 h-12 rounded-2xl bg-surface-container items-center justify-center">
           <Plus size={24} color="#515f74" />
        </View>
        <Text className="text-base font-bold text-on-surface">Add New Address</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderScheduleStep = () => (
    <ScrollView className="flex-1 px-6 py-8">
      <Text className="text-xs font-black text-primary uppercase tracking-[2px] mb-6">Select Delivery Window</Text>
      {['Today, 6:00 PM', 'Tomorrow, 10:00 AM', 'Wednesday, 2:00 PM'].map((time) => (
        <TouchableOpacity key={time} className="bg-white p-6 rounded-[24px] border border-outline-variant/10 mb-4 flex-row justify-between items-center">
           <View className="flex-row items-center gap-4">
              <Calendar size={20} color="#515f74" />
              <Text className="text-base font-bold text-on-surface">{time}</Text>
           </View>
           <View className="w-6 h-6 rounded-full border border-outline-variant/30" />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderPaymentStep = () => (
    <ScrollView className="flex-1 px-6 py-8">
      <TouchableOpacity className="bg-surface-container-low p-6 rounded-[24px] border border-primary flex-row items-center justify-between mb-6">
        <View className="flex-row items-center gap-4">
           <CreditCard size={24} color="#904d00" />
           <View>
              <Text className="text-sm font-bold text-on-surface">•••• •••• •••• 4242</Text>
              <Text className="text-[10px] font-bold text-on-surface-variant uppercase">Expires 12/26</Text>
           </View>
        </View>
        <Check size={20} color="#904d00" />
      </TouchableOpacity>
    </ScrollView>
  );

  const renderConfirmStep = () => (
    <ScrollView className="flex-1 px-6 py-8" showsVerticalScrollIndicator={false}>
      {/* Address Review Requirement: With EDIT button */}
      <View className="mb-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xs font-black text-primary uppercase tracking-[2px]">Shipping Node</Text>
          <TouchableOpacity className="flex-row items-center gap-1 bg-orange-50 px-3 py-1 rounded-full">
             <Edit3 size={12} color="#904d00" />
             <Text className="text-[10px] font-bold text-primary uppercase">Edit</Text>
          </TouchableOpacity>
        </View>
        <View className="bg-surface-container-low p-5 rounded-2xl">
           <Text className="text-base font-bold text-on-surface">Office Hub</Text>
           <Text className="text-sm font-medium text-on-surface-variant mt-1">123 Kinetic Way, Chennai, TN 600001</Text>
        </View>
      </View>

      {/* Cart Items Requirement: Quantity picker with + and - */}
      <Text className="text-xs font-black text-primary uppercase tracking-[2px] mb-4">Your Selection</Text>
      {items.map((item) => (
        <View key={item.id} className="mb-4 bg-white p-4 rounded-2xl border border-outline-variant/10 flex-row items-center">
           <View className="w-12 h-12 rounded-xl bg-surface-container items-center justify-center mr-4">
              <Zap size={20} color="#904d00" />
           </View>
           <View className="flex-1">
              <Text className="text-sm font-bold text-on-surface" numberOfLines={1}>{item.name}</Text>
              <Text className="text-xs font-bold text-primary">${item.price.toFixed(2)}</Text>
           </View>
           
           <View className="flex-row items-center bg-surface-container px-2 py-1 rounded-xl gap-3">
              <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                 <Minus size={16} color="#515f74" />
              </TouchableOpacity>
              <Text className="text-sm font-black text-on-surface w-4 text-center">{item.quantity}</Text>
              <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                 <Plus size={16} color="#904d00" />
              </TouchableOpacity>
           </View>
        </View>
      ))}

      {/* Coupon Requirement */}
      <View className="mt-4 mb-8">
         <Text className="text-xs font-black text-primary uppercase tracking-[2px] mb-4">Promo Sequence</Text>
         <View className="flex-row gap-3">
            <View className="flex-1 flex-row items-center bg-surface-container-highest px-4 py-3 rounded-xl">
               <Ticket size={18} color="#564334" opacity={0.4} />
               <TextInput 
                 placeholder="Add a coupon code" 
                 placeholderTextColor="#56433480"
                 className="flex-1 ml-3 text-sm font-bold text-on-surface"
               />
            </View>
            <TouchableOpacity className="bg-primary px-6 items-center justify-center rounded-xl">
               <Text className="text-[10px] font-black text-white uppercase">Apply</Text>
            </TouchableOpacity>
         </View>
      </View>

      {/* Order Summary */}
      <View className="bg-surface-container p-6 rounded-3xl mb-12">
         <View className="flex-row justify-between mb-2">
            <Text className="text-sm font-medium text-on-surface-variant">Subtotal</Text>
            <Text className="text-sm font-bold text-on-surface">${total.toFixed(2)}</Text>
         </View>
         <View className="flex-row justify-between mb-2">
            <Text className="text-sm font-medium text-on-surface-variant">Taxes</Text>
            <Text className="text-sm font-bold text-on-surface">$0.00</Text>
         </View>
         <View className="h-[1px] bg-outline-variant/10 my-4" />
         <View className="flex-row justify-between">
            <Text className="text-base font-black text-on-surface uppercase">Total Price</Text>
            <Text className="text-xl font-black text-primary">${total.toFixed(2)}</Text>
         </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {renderProgressBar()}
      {renderStepHeader()}
      
      <View className="flex-1">
        {currentStep === 1 && renderAddressStep()}
        {currentStep === 2 && renderScheduleStep()}
        {currentStep === 3 && renderPaymentStep()}
        {currentStep === 4 && renderConfirmStep()}
      </View>

      <View className="px-6 pt-4 pb-10 bg-white border-t border-outline-variant/10 shadow-premium">
         <TouchableOpacity 
           onPress={handleNext}
           className="bg-primary h-16 rounded-2xl flex-row items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-orange-900/20"
         >
           {/* Requirement: Step 4 button text and total price */}
           <Text className="text-white font-black text-lg uppercase tracking-widest">
             {currentStep === 4 ? 'Continue to Review' : 'Next Sequence'}
           </Text>
           {currentStep === 4 && (
             <>
               <View className="w-1.5 h-1.5 rounded-full bg-white/40" />
               <Text className="text-white/80 font-bold">${total.toFixed(2)}</Text>
             </>
           )}
           <ChevronRight size={20} color="white" />
         </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
