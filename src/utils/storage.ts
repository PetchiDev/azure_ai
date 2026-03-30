import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const unifiedStorage = {
  setItem: async (name: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(name, value);
    } else {
      await AsyncStorage.setItem(name, value);
    }
  },
  getItem: async (name: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(name);
    } else {
      return await AsyncStorage.getItem(name) ?? null;
    }
  },
  removeItem: async (name: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(name);
    } else {
      await AsyncStorage.removeItem(name);
    }
  },
};
