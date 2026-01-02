import { create } from 'zustand';
import type { Order, OrderFilters } from '@/types';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from './useAuthStore';

interface OrderState {
  orders: Order[];
  filters: OrderFilters;
  isLoading: boolean;
  setOrders: (orders: Order[]) => void;
  setFilters: (filters: OrderFilters) => void;
  fetchOrders: () => Promise<void>;
  createOrder: (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => Promise<Order | null>;
  updateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
  subscribeToOrders: () => () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  filters: {},
  isLoading: false,
  
  setOrders: (orders) => set({ orders }),
  
  setFilters: (filters) => {
    set({ filters });
    get().fetchOrders();
  },
  
  fetchOrders: async () => {
    set({ isLoading: true });
    try {
      const { filters } = get();
      let query = supabase
        .from('orders')
        .select('*, user:profiles(*)')
        .order('created_at', { ascending: false });
      
      // Only filter by status if not admin (admins see all)
      const { profile } = useAuthStore.getState();
      if (profile?.role !== 'admin') {
        query = query.eq('status', 'pending');
      }
      
      if (filters.from_city) {
        query = query.eq('from_city', filters.from_city);
      }
      if (filters.to_city) {
        query = query.eq('to_city', filters.to_city);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }
      
      set({ orders: (data || []) as Order[] });
    } catch (error) {
      console.error('Error in fetchOrders:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  createOrder: async (orderData) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select('*, user:profiles(*)')
        .single();
      
      if (error) {
        console.error('Error creating order:', error);
        return null;
      }
      
      const newOrder = data as Order;
      set((state) => ({ orders: [newOrder, ...state.orders] }));
      return newOrder;
    } catch (error) {
      console.error('Error in createOrder:', error);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateOrder: async (id: string, updates: Partial<Order>) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select('*, user:profiles(*)')
        .single();
      
      if (error) {
        console.error('Error updating order:', error);
        return;
      }
      
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === id ? (data as Order) : order
        ),
      }));
    } catch (error) {
      console.error('Error in updateOrder:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  subscribeToOrders: () => {
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          get().fetchOrders();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  },
}));

