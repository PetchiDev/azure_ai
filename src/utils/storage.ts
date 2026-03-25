import { Platform } from 'react-native';
import { MMKV } from 'react-native-mmkv';



// Native storage instance (only initialized on native)
const mmkv = Platform.OS !== 'web' ? new (require('react-native-mmkv').MMKV)() : null;

export const unifiedStorage = {
  setItem: (name: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(name, value);
    } else {
      mmkv?.set(name, value);
    }
  },
  getItem: (name: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(name);
    } else {
      return mmkv?.getString(name) ?? null;
    }
  },
  removeItem: (name: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(name);
    } else {
      mmkv?.delete(name);
    }
  },
};
