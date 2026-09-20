'use client';

import { createClient, isSupabaseConfigured } from './supabase/client';
import { RestaurantTable, TableStatus } from './types';
import { toValidUUID } from './uuid-utils';

const DEFAULT_INITIAL_TABLES: Omit<RestaurantTable, 'id' | 'restaurant_id'>[] = [
  { name: 'Table 1', zone: 'Main Dining', capacity: 4, status: 'active', sort_order: 1 },
  { name: 'Table 2', zone: 'Main Dining', capacity: 2, status: 'active', sort_order: 2 },
  { name: 'Table 3', zone: 'Main Dining', capacity: 4, status: 'active', sort_order: 3 },
  { name: 'Table 4', zone: 'Main Dining', capacity: 6, status: 'active', sort_order: 4 },
  { name: 'Table 5', zone: 'Main Dining', capacity: 2, status: 'active', sort_order: 5 },
  { name: 'Table 6', zone: 'Main Dining', capacity: 4, status: 'active', sort_order: 6 },
  { name: 'Patio P-1', zone: 'Terrace Garden', capacity: 4, status: 'active', sort_order: 7 },
  { name: 'Patio P-2', zone: 'Terrace Garden', capacity: 4, status: 'active', sort_order: 8 },
  { name: 'Bar B-1', zone: 'Botanical Bar', capacity: 1, status: 'active', sort_order: 9 },
  { name: 'Bar B-2', zone: 'Botanical Bar', capacity: 1, status: 'active', sort_order: 10 },
  { name: 'VIP Booth', zone: 'VIP Lounge', capacity: 8, status: 'active', sort_order: 11 },
];

function getStorageKey(restaurantId: string): string {
  return `serveos_tables_${toValidUUID(restaurantId)}`;
}

function getStoredTables(restaurantId: string): RestaurantTable[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey(restaurantId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredTables(restaurantId: string, tables: RestaurantTable[], notify: boolean = false): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(restaurantId), JSON.stringify(tables));
    if (notify) {
      window.dispatchEvent(new CustomEvent('serveos_tables_updated', { detail: { restaurantId, tables } }));
    }
  } catch (e) {
    console.error('Failed to cache tables in localStorage:', e);
  }
}

export const TableService = {
  // ==========================================
  // GET TABLES (Multi-tenant Supabase with fallback)
  // ==========================================
  async getTables(restaurantId: string): Promise<RestaurantTable[]> {
    if (!restaurantId) return [];
    const validRestaurantId = toValidUUID(restaurantId);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('restaurant_tables')
          .select('*')
          .or(`restaurant_id.eq.${validRestaurantId},restaurant_id.eq.${restaurantId}`)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          saveStoredTables(restaurantId, data as RestaurantTable[]);
          return data as RestaurantTable[];
        }

        // If no tables exist for this restaurant yet, seed defaults in Supabase
        if (!error && data && data.length === 0) {
          const seeds = DEFAULT_INITIAL_TABLES.map((t) => ({
            ...t,
            restaurant_id: validRestaurantId,
          }));

          const { data: seededData, error: seedError } = await supabase
            .from('restaurant_tables')
            .insert(seeds)
            .select();

          if (!seedError && seededData && seededData.length > 0) {
            saveStoredTables(restaurantId, seededData as RestaurantTable[]);
            return seededData as RestaurantTable[];
          }
        }
      } catch (err) {
        console.warn('Supabase getTables failed, falling back to local storage:', err);
      }
    }

    // Local Storage Fallback
    const cached = getStoredTables(restaurantId);
    if (cached && cached.length > 0) {
      return cached;
    }

    // Default seeded fallback in local storage
    const fallbackTables: RestaurantTable[] = DEFAULT_INITIAL_TABLES.map((t, idx) => ({
      ...t,
      id: `tbl-${idx + 1}-${Date.now()}`,
      restaurant_id: validRestaurantId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    saveStoredTables(restaurantId, fallbackTables);
    return fallbackTables;
  },

  // ==========================================
  // CREATE TABLE
  // ==========================================
  async createTable(params: {
    restaurantId: string;
    name: string;
    zone: string;
    capacity: number;
    status?: TableStatus;
  }): Promise<RestaurantTable> {
    const validRestaurantId = toValidUUID(params.restaurantId);
    const newTableData = {
      restaurant_id: validRestaurantId,
      name: params.name.trim(),
      zone: params.zone.trim() || 'Main Dining',
      capacity: Math.max(1, Number(params.capacity) || 4),
      status: params.status || 'active',
      sort_order: Date.now() % 100000,
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('restaurant_tables')
          .insert(newTableData)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          const current = getStoredTables(params.restaurantId);
          current.push(data as RestaurantTable);
          saveStoredTables(params.restaurantId, current, true);
          return data as RestaurantTable;
        }
      } catch (err: any) {
        console.error('Supabase createTable failed:', err?.message || err);
      }
    }

    // Local fallback
    const localTable: RestaurantTable = {
      ...newTableData,
      id: `tbl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const current = getStoredTables(params.restaurantId);
    current.push(localTable);
    saveStoredTables(params.restaurantId, current, true);
    return localTable;
  },

  // ==========================================
  // UPDATE TABLE (Rename, change zone, seats, status)
  // ==========================================
  async updateTable(
    id: string,
    restaurantId: string,
    updates: Partial<Pick<RestaurantTable, 'name' | 'zone' | 'capacity' | 'status' | 'sort_order'>>
  ): Promise<RestaurantTable> {
    const validRestaurantId = toValidUUID(restaurantId);
    const payload: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    };
    if (payload.name) payload.name = payload.name.trim();
    if (payload.zone) payload.zone = payload.zone.trim();
    if (payload.capacity) payload.capacity = Math.max(1, Number(payload.capacity));

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('restaurant_tables')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          const current = getStoredTables(restaurantId);
          const idx = current.findIndex((t) => t.id === id);
          if (idx !== -1) {
            current[idx] = data as RestaurantTable;
          } else {
            current.push(data as RestaurantTable);
          }
          saveStoredTables(restaurantId, current, true);
          return data as RestaurantTable;
        }
      } catch (err: any) {
        console.error('Supabase updateTable failed:', err?.message || err);
      }
    }

    // Local fallback
    const current = getStoredTables(restaurantId);
    const idx = current.findIndex((t) => t.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...payload };
      saveStoredTables(restaurantId, current, true);
      return current[idx];
    }
    throw new Error('Table not found');
  },

  // ==========================================
  // DELETE TABLE
  // ==========================================
  async deleteTable(id: string, restaurantId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('restaurant_tables')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (err: any) {
        console.error('Supabase deleteTable failed:', err?.message || err);
      }
    }

    // Update local cache
    const current = getStoredTables(restaurantId);
    const filtered = current.filter((t) => t.id !== id);
    saveStoredTables(restaurantId, filtered, true);
    return true;
  },
};
