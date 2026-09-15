'use client';

import { createClient, isSupabaseConfigured } from './supabase/client';
import { Order, OrderItem, OrderWithItems, OrderStatus, CartItem, OrderStats } from './types';
import { INITIAL_ORDERS } from './mock-data';

const STORAGE_ORDERS_KEY = 'qr_saas_orders_v2';

function getStoredOrders(): OrderWithItems[] {
  if (typeof window === 'undefined') return INITIAL_ORDERS;
  try {
    const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ORDERS;
  }
}

function saveStoredOrders(orders: OrderWithItems[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
  // Dispatch custom event for real-time reactivity in the browser tab & other tabs
  window.dispatchEvent(new CustomEvent('qr_orders_updated'));
}

export const OrderService = {
  // ==========================================
  // CREATE ORDER (Public customer table order)
  // ==========================================
  async createOrder(params: {
    restaurantId: string;
    tableNumber: string;
    customerNotes?: string;
    items: CartItem[];
  }): Promise<OrderWithItems> {
    if (!params.restaurantId) throw new Error('Restaurant ID is required');
    if (!params.tableNumber?.trim()) throw new Error('Table number is required');
    if (!params.items || params.items.length === 0) throw new Error('Cart cannot be empty');

    const totalAmount = params.items.reduce(
      (sum, item) => sum + Number(item.menuItem.price) * item.quantity,
      0
    );

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();

        // 1. Insert order
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            restaurant_id: params.restaurantId,
            table_number: params.tableNumber.trim(),
            customer_notes: params.customerNotes?.trim() || null,
            status: 'pending',
            total_amount: totalAmount,
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // 2. Insert line items
        const lineItems = params.items.map((it) => ({
          order_id: orderData.id,
          menu_item_id: it.menuItem.id,
          name: it.menuItem.name,
          quantity: it.quantity,
          price: it.menuItem.price,
        }));

        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .insert(lineItems)
          .select();

        if (itemsError) throw itemsError;

        return {
          ...orderData,
          items: itemsData || [],
        };
      } catch (err: any) {
        console.warn('Supabase createOrder failed, saving to local store:', err?.message);
      }
    }

    // Fallback: LocalStorage
    const orderId = `ord-${Date.now()}`;
    const lineItems: OrderItem[] = params.items.map((it, idx) => ({
      id: `oi-${Date.now()}-${idx}`,
      order_id: orderId,
      menu_item_id: it.menuItem.id,
      name: it.menuItem.name,
      quantity: it.quantity,
      price: it.menuItem.price,
      created_at: new Date().toISOString(),
    }));

    const newOrder: OrderWithItems = {
      id: orderId,
      restaurant_id: params.restaurantId,
      table_number: params.tableNumber.trim(),
      customer_notes: params.customerNotes?.trim() || null,
      status: 'pending',
      total_amount: parseFloat(totalAmount.toFixed(2)),
      created_at: new Date().toISOString(),
      items: lineItems,
    };

    const allOrders = getStoredOrders();
    allOrders.unshift(newOrder);
    saveStoredOrders(allOrders);

    return newOrder;
  },

  // ==========================================
  // GET ORDER BY ID (For Customer Tracker)
  // ==========================================
  async getOrderById(orderId: string): Promise<OrderWithItems | null> {
    if (!orderId) return null;

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data: orderData, error: oError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (!oError && orderData) {
          const { data: itemsData } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderId);

          return {
            ...orderData,
            items: itemsData || [],
          };
        }
      } catch (err) {
        console.warn('Supabase getOrderById failed, using local store:', err);
      }
    }

    const allOrders = getStoredOrders();
    return allOrders.find((o) => o.id === orderId) || null;
  },

  // ==========================================
  // GET RESTAURANT ORDERS (Owner KDS)
  // ==========================================
  async getRestaurantOrders(restaurantId: string, status?: OrderStatus | 'all'): Promise<OrderWithItems[]> {
    if (!restaurantId) return [];

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('restaurant_id', restaurantId)
          .order('created_at', { ascending: false });

        if (status && status !== 'all') {
          query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data.map((o: any) => ({
            ...o,
            items: o.order_items || [],
          }));
        }
      } catch (err) {
        console.warn('Supabase getRestaurantOrders failed, using local store:', err);
      }
    }

    const allOrders = getStoredOrders();
    let filtered = allOrders.filter((o) => o.restaurant_id === restaurantId);
    if (status && status !== 'all') {
      filtered = filtered.filter((o) => o.status === status);
    }
    return filtered;
  },

  // ==========================================
  // UPDATE ORDER STATUS (Kitchen Workflow)
  // ==========================================
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    restaurantId?: string
  ): Promise<OrderWithItems> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase
          .from('orders')
          .update({ status })
          .eq('id', orderId);

        if (restaurantId) {
          query = query.eq('restaurant_id', restaurantId);
        }

        const { data, error } = await query.select().single();
        if (error) throw error;
      } catch (err: any) {
        console.warn('Supabase updateOrderStatus failed, updating local store:', err?.message);
      }
    }

    const allOrders = getStoredOrders();
    const index = allOrders.findIndex((o) => o.id === orderId && (!restaurantId || o.restaurant_id === restaurantId));
    if (index === -1) throw new Error('Order not found');

    const updated: OrderWithItems = {
      ...allOrders[index],
      status,
      updated_at: new Date().toISOString(),
    };
    allOrders[index] = updated;
    saveStoredOrders(allOrders);

    return updated;
  },

  // ==========================================
  // REALTIME SUBSCRIPTION (Supabase + Local Event Bus)
  // ==========================================
  subscribeToRestaurantOrders(
    restaurantId: string,
    onUpdate: () => void
  ): () => void {
    let supabaseChannel: any = null;

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        supabaseChannel = supabase
          .channel(`restaurant_orders_${restaurantId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'orders',
              filter: `restaurant_id=eq.${restaurantId}`,
            },
            () => {
              onUpdate();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Supabase realtime subscription failed:', err);
      }
    }

    // Local custom event listener for instant reactivity
    const handleLocalUpdate = () => onUpdate();
    if (typeof window !== 'undefined') {
      window.addEventListener('qr_orders_updated', handleLocalUpdate);
      window.addEventListener('storage', handleLocalUpdate);
    }

    // Return cleanup function
    return () => {
      if (supabaseChannel) {
        supabaseChannel.unsubscribe();
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('qr_orders_updated', handleLocalUpdate);
        window.removeEventListener('storage', handleLocalUpdate);
      }
    };
  },

  subscribeToSingleOrder(
    orderId: string,
    onUpdate: (updatedOrder: OrderWithItems) => void
  ): () => void {
    let supabaseChannel: any = null;

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        supabaseChannel = supabase
          .channel(`order_${orderId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'orders',
              filter: `id=eq.${orderId}`,
            },
            async (payload: any) => {
              const full = await OrderService.getOrderById(orderId);
              if (full) onUpdate(full);
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Supabase realtime single order subscription error:', err);
      }
    }

    const handleLocalUpdate = () => {
      OrderService.getOrderById(orderId).then((full) => {
        if (full) onUpdate(full);
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('qr_orders_updated', handleLocalUpdate);
      window.addEventListener('storage', handleLocalUpdate);
    }

    return () => {
      if (supabaseChannel) {
        supabaseChannel.unsubscribe();
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('qr_orders_updated', handleLocalUpdate);
        window.removeEventListener('storage', handleLocalUpdate);
      }
    };
  },

  // ==========================================
  // GET ORDER STATS (Dashboard Metrics)
  // ==========================================
  async getOrderStats(restaurantId: string): Promise<OrderStats> {
    const orders = await this.getRestaurantOrders(restaurantId);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const preparingOrders = orders.filter((o) => o.status === 'preparing').length;
    const readyOrders = orders.filter((o) => o.status === 'ready').length;
    const completedOrders = orders.filter((o) => o.status === 'completed').length;

    const todayRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    return {
      totalOrders,
      pendingOrders,
      preparingOrders,
      readyOrders,
      completedOrders,
      todayRevenue: parseFloat(todayRevenue.toFixed(2)),
    };
  },
};
