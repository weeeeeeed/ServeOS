'use client';

import { createClient, isSupabaseConfigured } from './supabase/client';
import { SubscriptionPlanEntity } from './types';
import { INITIAL_SUBSCRIPTION_PLANS } from './mock-data';
import { toValidUUID } from './uuid-utils';

const STORAGE_PLANS_KEY = 'qr_saas_subscription_plans_v1';

function getStoredPlans(): SubscriptionPlanEntity[] {
  if (typeof window === 'undefined') return INITIAL_SUBSCRIPTION_PLANS;
  try {
    const raw = localStorage.getItem(STORAGE_PLANS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_PLANS_KEY, JSON.stringify(INITIAL_SUBSCRIPTION_PLANS));
      return INITIAL_SUBSCRIPTION_PLANS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SUBSCRIPTION_PLANS;
  }
}

function saveStoredPlans(plans: SubscriptionPlanEntity[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_PLANS_KEY, JSON.stringify(plans));
  window.dispatchEvent(new CustomEvent('qr_plans_updated'));
}

export const SubscriptionPlanService = {
  // ==========================================
  // GET ALL PLANS
  // ==========================================
  async getPlans(includeInactive = false): Promise<SubscriptionPlanEntity[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase.from('subscription_plans').select('*').order('sort_order', { ascending: true });
        if (!includeInactive) {
          query = query.eq('is_active', true);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Supabase getPlans error, falling back to local store:', err);
      }
    }

    const all = getStoredPlans();
    const filtered = includeInactive ? all : all.filter((p) => p.is_active);
    return filtered.sort((a, b) => a.sort_order - b.sort_order);
  },

  // ==========================================
  // GET PLAN BY ID
  // ==========================================
  async getPlanById(id: string): Promise<SubscriptionPlanEntity | null> {
    const plans = await this.getPlans(true);
    return plans.find((p) => p.id === id) || null;
  },

  // ==========================================
  // CREATE PLAN (ADMIN ONLY)
  // ==========================================
  async createPlan(
    planData: Omit<SubscriptionPlanEntity, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SubscriptionPlanEntity> {
    const validId = toValidUUID(planData.slug || Math.random().toString(36));
    const newPlan: SubscriptionPlanEntity = {
      ...planData,
      id: validId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('subscription_plans').insert(newPlan).select().single();
        if (!error && data) {
          window.dispatchEvent(new CustomEvent('qr_plans_updated'));
          return data;
        }
      } catch (err) {
        console.warn('Supabase createPlan error, falling back to local store:', err);
      }
    }

    const all = getStoredPlans();
    all.push(newPlan);
    saveStoredPlans(all);
    return newPlan;
  },

  // ==========================================
  // UPDATE PLAN (ADMIN ONLY)
  // ==========================================
  async updatePlan(
    id: string,
    updates: Partial<SubscriptionPlanEntity>
  ): Promise<SubscriptionPlanEntity> {
    const validId = toValidUUID(id);
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('subscription_plans')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', validId)
          .select()
          .single();
        if (!error && data) {
          window.dispatchEvent(new CustomEvent('qr_plans_updated'));
          return data;
        }
      } catch (err) {
        console.warn('Supabase updatePlan error, falling back to local store:', err);
      }
    }

    const all = getStoredPlans();
    const idx = all.findIndex((p) => p.id === id || p.id === validId);
    if (idx === -1) throw new Error('Plan not found');

    const updated = {
      ...all[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    all[idx] = updated;
    saveStoredPlans(all);
    return updated;
  },

  // ==========================================
  // DELETE PLAN (ADMIN ONLY)
  // ==========================================
  async deletePlan(id: string): Promise<boolean> {
    const validId = toValidUUID(id);
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('subscription_plans').delete().eq('id', validId);
      } catch (err) {
        console.warn('Supabase deletePlan error:', err);
      }
    }

    const all = getStoredPlans();
    const filtered = all.filter((p) => p.id !== id);
    saveStoredPlans(filtered);
    return true;
  },

  // ==========================================
  // TOGGLE STATUS (ENABLE / DISABLE)
  // ==========================================
  async togglePlanStatus(id: string, active: boolean): Promise<SubscriptionPlanEntity> {
    return this.updatePlan(id, { is_active: active });
  },

  // ==========================================
  // REORDER PLANS (UP / DOWN)
  // ==========================================
  async reorderPlans(orderedIds: string[]): Promise<SubscriptionPlanEntity[]> {
    const all = getStoredPlans();
    const reordered = all.map((plan) => {
      const newOrder = orderedIds.indexOf(plan.id);
      if (newOrder !== -1) {
        return { ...plan, sort_order: newOrder + 1 };
      }
      return plan;
    });

    saveStoredPlans(reordered);
    return reordered.sort((a, b) => a.sort_order - b.sort_order);
  },

  // ==========================================
  // SUBSCRIBE TO PLAN CHANGES (REALTIME SYNC)
  // ==========================================
  subscribe(callback: (plans: SubscriptionPlanEntity[]) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handler = async () => {
      const updated = await this.getPlans(true);
      callback(updated);
    };

    window.addEventListener('qr_plans_updated', handler);
    return () => {
      window.removeEventListener('qr_plans_updated', handler);
    };
  },
};
