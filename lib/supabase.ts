import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Lazy-loaded storage so SSR / web preview never touches `window` at import time
const customStorage = {
  getItem: (key: string): Promise<string | null> => {
    if (typeof window === 'undefined') return Promise.resolve(null);
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return AsyncStorage.getItem(key);
    } catch {
      return Promise.resolve(localStorage.getItem(key));
    }
  },
  setItem: (key: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return Promise.resolve();
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return AsyncStorage.setItem(key, value);
    } catch {
      localStorage.setItem(key, value);
      return Promise.resolve();
    }
  },
  removeItem: (key: string): Promise<void> => {
    if (typeof window === 'undefined') return Promise.resolve();
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return AsyncStorage.removeItem(key);
    } catch {
      localStorage.removeItem(key);
      return Promise.resolve();
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});