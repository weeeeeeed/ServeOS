'use client';

import { createClient, isSupabaseConfigured } from './supabase/client';
import { Feedback, FeedbackStats } from './types';
import { INITIAL_FEEDBACK } from './mock-data';
import { toValidUUID, isValidUUID } from './uuid-utils';

const STORAGE_FEEDBACK_KEY = 'qr_saas_feedback_v2';

function getStoredFeedback(): Feedback[] {
  if (typeof window === 'undefined') return INITIAL_FEEDBACK;
  try {
    const raw = localStorage.getItem(STORAGE_FEEDBACK_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_FEEDBACK_KEY, JSON.stringify(INITIAL_FEEDBACK));
      return INITIAL_FEEDBACK;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FEEDBACK;
  }
}

function saveStoredFeedback(list: Feedback[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_FEEDBACK_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('qr_feedback_updated'));
}

export const FeedbackService = {
  // ==========================================
  // SUBMIT FEEDBACK (Public diner rating)
  // ==========================================
  async submitFeedback(params: {
    restaurantId: string;
    orderId?: string | null;
    rating: number;
    comment?: string;
    customerName?: string;
  }): Promise<Feedback> {
    if (!params.restaurantId) throw new Error('Restaurant ID is required');
    if (!params.rating || params.rating < 1 || params.rating > 5) {
      throw new Error('Please select a star rating from 1 to 5');
    }

    const validRestaurantId = toValidUUID(params.restaurantId);
    const validOrderId = params.orderId && isValidUUID(params.orderId) ? params.orderId : null;

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('feedback')
          .insert({
            restaurant_id: validRestaurantId,
            order_id: validOrderId,
            customer_name: params.customerName?.trim() || 'Diner',
            rating: params.rating,
            comment: params.comment?.trim() || null,
          })
          .select()
          .single();

        if (error) throw error;

        // Also update local cache
        const all = getStoredFeedback();
        all.unshift(data);
        saveStoredFeedback(all);

        console.log('✅ Supabase feedback submitted successfully:', data.id);
        return data;
      } catch (err: any) {
        console.error('❌ Supabase submitFeedback error:', err?.message || err);
        throw new Error(err?.message || 'Failed to submit review to database');
      }
    }

    const all = getStoredFeedback();
    const newFeedback: Feedback = {
      id: `fb-${Date.now()}`,
      restaurant_id: params.restaurantId,
      order_id: params.orderId || null,
      customer_name: params.customerName?.trim() || 'Diner',
      rating: params.rating,
      comment: params.comment?.trim() || null,
      created_at: new Date().toISOString(),
    };

    all.unshift(newFeedback);
    saveStoredFeedback(all);
    return newFeedback;
  },

  // ==========================================
  // GET FEEDBACK FOR RESTAURANT
  // ==========================================
  async getRestaurantFeedback(
    restaurantId: string,
    ratingFilter?: number | 'all'
  ): Promise<Feedback[]> {
    if (!restaurantId) return [];

    const validRestaurantId = toValidUUID(restaurantId);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        let query = supabase
          .from('feedback')
          .select('*')
          .or(`restaurant_id.eq.${validRestaurantId},restaurant_id.eq.${restaurantId}`)
          .order('created_at', { ascending: false });

        if (ratingFilter && ratingFilter !== 'all') {
          query = query.eq('rating', ratingFilter);
        }

        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getRestaurantFeedback failed, using local store:', err);
      }
    }

    const all = getStoredFeedback();
    let filtered = all.filter((f) => f.restaurant_id === restaurantId);
    if (ratingFilter && ratingFilter !== 'all') {
      filtered = filtered.filter((f) => f.rating === ratingFilter);
    }
    return filtered;
  },

  // ==========================================
  // GET FEEDBACK STATS & DISTRIBUTION
  // ==========================================
  async getFeedbackStats(restaurantId: string): Promise<FeedbackStats> {
    const list = await this.getRestaurantFeedback(restaurantId);

    const totalReviews = list.length;
    if (totalReviews === 0) {
      return {
        averageRating: 0.0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    list.forEach((fb) => {
      const r = Math.min(5, Math.max(1, Math.round(fb.rating))) as 1 | 2 | 3 | 4 | 5;
      ratingDistribution[r] = (ratingDistribution[r] || 0) + 1;
      sum += fb.rating;
    });

    const averageRating = parseFloat((sum / totalReviews).toFixed(1));

    return {
      averageRating,
      totalReviews,
      ratingDistribution,
    };
  },

  subscribeToFeedback(restaurantId: string, onUpdate: () => void): () => void {
    const handleLocal = () => onUpdate();
    if (typeof window !== 'undefined') {
      window.addEventListener('qr_feedback_updated', handleLocal);
      window.addEventListener('storage', handleLocal);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('qr_feedback_updated', handleLocal);
        window.removeEventListener('storage', handleLocal);
      }
    };
  },
};
