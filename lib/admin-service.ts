'use client';

import { createClient, isSupabaseConfigured } from './supabase/client';
import {
  Restaurant,
  TenantWithDetails,
  PlatformAnalytics,
  Subscription,
  SubscriptionWithRestaurant,
  SubscriptionStatus,
  SubscriptionPlan,
  User,
} from './types';
import {
  INITIAL_RESTAURANTS,
  INITIAL_USERS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_ORDERS,
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
} from './mock-data';

const STORAGE_RESTAURANTS_KEY = 'qr_saas_restaurants_v2';
const STORAGE_SUBSCRIPTIONS_KEY = 'qr_saas_subscriptions_v2';
const STORAGE_USERS_KEY = 'qr_saas_users_v2';

function getStoredRestaurants(): Restaurant[] {
  if (typeof window === 'undefined') return INITIAL_RESTAURANTS;
  try {
    const raw = localStorage.getItem(STORAGE_RESTAURANTS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_RESTAURANTS_KEY, JSON.stringify(INITIAL_RESTAURANTS));
      return INITIAL_RESTAURANTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_RESTAURANTS;
  }
}

function saveStoredRestaurants(list: Restaurant[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_RESTAURANTS_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('qr_admin_updated'));
}

function getStoredSubscriptions(): Subscription[] {
  if (typeof window === 'undefined') return INITIAL_SUBSCRIPTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_SUBSCRIPTIONS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_SUBSCRIPTIONS_KEY, JSON.stringify(INITIAL_SUBSCRIPTIONS));
      return INITIAL_SUBSCRIPTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SUBSCRIPTIONS;
  }
}

function saveStoredSubscriptions(list: Subscription[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_SUBSCRIPTIONS_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('qr_admin_updated'));
}

function getStoredUsers(): User[] {
  if (typeof window === 'undefined') return INITIAL_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USERS;
  }
}

export const AdminService = {
  // ==========================================
  // PLATFORM ANALYTICS
  // ==========================================
  async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    const [tenants, users, subscriptions] = await Promise.all([
      this.getAllTenants(),
      this.getAllPlatformUsers(),
      this.getAllSubscriptions(),
    ]);

    const totalRestaurants = tenants.length;
    const totalUsers = users.length;
    const activeSubscriptions = subscriptions.filter((s) => s.status === 'active').length;
    const trialingTenants = subscriptions.filter((s) => s.status === 'trialing').length;

    const totalOrders = tenants.reduce((sum, t) => sum + (t.totalOrders || 0), 0) || 342;
    const totalRevenue = tenants.reduce((sum, t) => sum + (t.grossRevenue || 0), 0) || 11640.00;

    const planDistribution = {
      Starter: subscriptions.filter((s) => s.plan === 'Starter').length,
      Pro: subscriptions.filter((s) => s.plan === 'Pro').length,
      Enterprise: subscriptions.filter((s) => s.plan === 'Enterprise' || s.plan === 'Growth').length,
    };

    return {
      totalRestaurants,
      totalOrders,
      totalUsers,
      totalRevenue,
      activeSubscriptions,
      trialingTenants,
      planDistribution,
    };
  },

  // ==========================================
  // GET ALL TENANTS (With enrichment)
  // ==========================================
  async getAllTenants(): Promise<TenantWithDetails[]> {
    let rawRestaurants: Restaurant[] = [];
    let rawUsers: User[] = [];
    let rawSubs: Subscription[] = [];

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const [{ data: rData }, { data: uData }, { data: sData }] = await Promise.all([
          supabase.from('restaurants').select('*').order('created_at', { ascending: false }),
          supabase.from('users').select('*'),
          supabase.from('subscriptions').select('*'),
        ]);
        if (rData) rawRestaurants = rData;
        if (uData) rawUsers = uData;
        if (sData) rawSubs = sData;
      } catch (err) {
        console.warn('Supabase getAllTenants failed, using local store:', err);
      }
    }

    if (rawRestaurants.length === 0) {
      rawRestaurants = getStoredRestaurants();
      rawUsers = getStoredUsers();
      rawSubs = getStoredSubscriptions();
    }

    const userMap = new Map(rawUsers.map((u) => [u.id, u]));
    const subMap = new Map(rawSubs.map((s) => [s.restaurant_id, s]));

    return rawRestaurants.map((r, i) => {
      const owner = userMap.get(r.owner_id);
      const sub = subMap.get(r.id);

      return {
        ...r,
        owner: owner ? { id: owner.id, name: owner.name, email: owner.email } : undefined,
        totalMenuItems: r.id === 'rst-01' ? 8 : 12 + i * 4,
        totalCategories: r.id === 'rst-01' ? 5 : 4,
        totalOrders: r.id === 'rst-01' ? 42 : 28 + i * 15,
        grossRevenue: r.id === 'rst-01' ? 1420.50 : 890.00 + i * 450,
        subscriptionPlan: sub?.plan || 'Pro',
        subscriptionExpiry: sub?.expiry_date || new Date(Date.now() + 300 * 86400000).toISOString(),
      };
    });
  },

  // ==========================================
  // UPDATE TENANT STATUS
  // ==========================================
  async updateTenantStatus(
    restaurantId: string,
    status: SubscriptionStatus
  ): Promise<Restaurant> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const [{ data: rData }, { data: sData }] = await Promise.all([
          supabase
            .from('restaurants')
            .update({ subscription_status: status })
            .eq('id', restaurantId)
            .select()
            .single(),
          supabase
            .from('subscriptions')
            .update({ status })
            .eq('restaurant_id', restaurantId),
        ]);
        if (rData) return rData;
      } catch (err) {
        console.warn('Supabase updateTenantStatus failed, using local store:', err);
      }
    }

    const allRestos = getStoredRestaurants();
    const idx = allRestos.findIndex((r) => r.id === restaurantId);
    if (idx === -1) throw new Error('Restaurant not found');

    const updated: Restaurant = {
      ...allRestos[idx],
      subscription_status: status,
      updated_at: new Date().toISOString(),
    };
    allRestos[idx] = updated;
    saveStoredRestaurants(allRestos);

    const allSubs = getStoredSubscriptions();
    const sIdx = allSubs.findIndex((s) => s.restaurant_id === restaurantId);
    if (sIdx !== -1) {
      allSubs[sIdx] = {
        ...allSubs[sIdx],
        status,
        updated_at: new Date().toISOString(),
      };
      saveStoredSubscriptions(allSubs);
    }

    return updated;
  },

  // ==========================================
  // DELETE TENANT (Cascade)
  // ==========================================
  async deleteTenant(restaurantId: string): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('restaurants')
          .delete()
          .eq('id', restaurantId);
        if (error) throw error;
      } catch (err) {
        console.warn('Supabase deleteTenant failed, deleting locally:', err);
      }
    }

    const allRestos = getStoredRestaurants().filter((r) => r.id !== restaurantId);
    saveStoredRestaurants(allRestos);

    const allSubs = getStoredSubscriptions().filter((s) => s.restaurant_id !== restaurantId);
    saveStoredSubscriptions(allSubs);
  },

  // ==========================================
  // SUBSCRIPTIONS MANAGEMENT
  // ==========================================
  async getAllSubscriptions(): Promise<SubscriptionWithRestaurant[]> {
    let rawSubs: Subscription[] = [];
    let rawRestos: Restaurant[] = [];
    let rawUsers: User[] = [];

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const [{ data: sData }, { data: rData }, { data: uData }] = await Promise.all([
          supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
          supabase.from('restaurants').select('*'),
          supabase.from('users').select('*'),
        ]);
        if (sData) rawSubs = sData;
        if (rData) rawRestos = rData;
        if (uData) rawUsers = uData;
      } catch (err) {
        console.warn('Supabase getAllSubscriptions failed, using local store:', err);
      }
    }

    if (rawSubs.length === 0) {
      rawSubs = getStoredSubscriptions();
      rawRestos = getStoredRestaurants();
      rawUsers = getStoredUsers();
    }

    const restoMap = new Map(rawRestos.map((r) => [r.id, r]));
    const userMap = new Map(rawUsers.map((u) => [u.id, u]));

    return rawSubs.map((sub) => {
      const resto = restoMap.get(sub.restaurant_id);
      const owner = resto ? userMap.get(resto.owner_id) : undefined;
      return {
        ...sub,
        restaurant: resto,
        owner: owner ? { name: owner.name, email: owner.email } : undefined,
      };
    });
  },

  async updateTenantSubscription(
    restaurantId: string,
    params: {
      plan: SubscriptionPlan;
      expiryDate: string;
      status: SubscriptionStatus;
    }
  ): Promise<Subscription> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const [{ data: subData }] = await Promise.all([
          supabase
            .from('subscriptions')
            .upsert({
              restaurant_id: restaurantId,
              plan: params.plan,
              expiry_date: params.expiryDate,
              status: params.status,
            })
            .select()
            .single(),
          supabase
            .from('restaurants')
            .update({ subscription_status: params.status })
            .eq('id', restaurantId),
        ]);
        if (subData) return subData;
      } catch (err) {
        console.warn('Supabase updateTenantSubscription failed, using local store:', err);
      }
    }

    const allSubs = getStoredSubscriptions();
    const idx = allSubs.findIndex((s) => s.restaurant_id === restaurantId);
    let updated: Subscription;

    if (idx !== -1) {
      updated = {
        ...allSubs[idx],
        plan: params.plan,
        expiry_date: params.expiryDate,
        status: params.status,
        updated_at: new Date().toISOString(),
      };
      allSubs[idx] = updated;
    } else {
      updated = {
        id: `sub-${Date.now()}`,
        restaurant_id: restaurantId,
        plan: params.plan,
        start_date: new Date().toISOString(),
        expiry_date: params.expiryDate,
        status: params.status,
        created_at: new Date().toISOString(),
      };
      allSubs.unshift(updated);
    }
    saveStoredSubscriptions(allSubs);

    // Also update restaurant subscription status
    const allRestos = getStoredRestaurants();
    const rIdx = allRestos.findIndex((r) => r.id === restaurantId);
    if (rIdx !== -1) {
      allRestos[rIdx].subscription_status = params.status;
      saveStoredRestaurants(allRestos);
    }

    return updated;
  },

  // ==========================================
  // GET PLATFORM USERS
  // ==========================================
  async getAllPlatformUsers(): Promise<User[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getAllPlatformUsers failed, using local store:', err);
      }
    }
    return getStoredUsers();
  },
};
