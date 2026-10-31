// FLEG Native: public Supabase client. This file contains ONLY the publishable key.
// No service_role key, privileged secrets, or changes to existing RLS policies.
import 'react-native-url-polyfill/auto';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient("https://zcubdqfzdbwtfcdsntoa.supabase.co", "sb_publishable_2yuNvpCgr0igeuuMEjyAZw_dd2X_sg-", {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

AppState.addEventListener('change', state => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
