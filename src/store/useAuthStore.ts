import { create } from 'zustand';
import type { Profile } from '@/types';
import { supabase } from '@/lib/supabase/client';

interface AuthState {
  profile: Profile | null;
  isLoading: boolean;
  setProfile: (profile: Profile | null) => void;
  fetchProfile: (telegramId: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  profile: null,
  isLoading: false,
  
  setProfile: (profile) => set({ profile }),
  
  fetchProfile: async (telegramId: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error fetching profile:', error);
        return;
      }
      
      if (data) {
        set({ profile: data as Profile });
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateProfile: async (updates: Partial<Profile>) => {
    const { profile } = get();
    if (!profile) return;
    
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating profile:', error);
        return;
      }
      
      if (data) {
        set({ profile: data as Profile });
      }
    } catch (error) {
      console.error('Error in updateProfile:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

