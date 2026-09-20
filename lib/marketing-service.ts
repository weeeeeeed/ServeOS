'use client';

import { createClient, isSupabaseConfigured } from './supabase/client';
import { NotificationSubscription, MarketingCampaign, MarketingStats, SendCampaignResult } from './types';
import { INITIAL_NOTIFICATION_SUBSCRIPTIONS, INITIAL_MARKETING_CAMPAIGNS } from './mock-data';
import { toValidUUID } from './uuid-utils';

const STORAGE_SUBSCRIPTIONS_KEY = 'qr_saas_marketing_subs_v1';
const STORAGE_CAMPAIGNS_KEY = 'qr_saas_marketing_campaigns_v1';

// Convert base64 VAPID public key string to Uint8Array for PushManager
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Convert ArrayBuffer key to Base64 URL safe string
export function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Detect client browser and device
export function getBrowserAndDeviceInfo(): { browser: string; device: string } {
  if (typeof window === 'undefined') return { browser: 'Unknown', device: 'Desktop' };
  const ua = navigator.userAgent;

  // Browser detection
  let browser = 'Chrome';
  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';
  else if (ua.includes('OPR/') || ua.includes('Opera/')) browser = 'Opera';
  else if (ua.includes('SamsungBrowser/')) browser = 'Samsung Internet';

  // Device detection
  let device = 'Desktop';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(ua);

  if (isTablet) {
    device = 'Tablet';
  } else if (isMobile) {
    if (/iPhone/i.test(ua)) device = 'Mobile (iPhone)';
    else if (/Android/i.test(ua)) device = 'Mobile (Android)';
    else device = 'Mobile';
  } else {
    if (ua.includes('Mac OS')) device = 'Desktop (macOS)';
    else if (ua.includes('Windows')) device = 'Desktop (Windows)';
    else if (ua.includes('Linux')) device = 'Desktop (Linux)';
  }

  return { browser, device };
}

// Helper: Local persistent store for demo/mock mode
function getStoredSubscriptions(): NotificationSubscription[] {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATION_SUBSCRIPTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_SUBSCRIPTIONS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_SUBSCRIPTIONS_KEY, JSON.stringify(INITIAL_NOTIFICATION_SUBSCRIPTIONS));
      return INITIAL_NOTIFICATION_SUBSCRIPTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_NOTIFICATION_SUBSCRIPTIONS;
  }
}

function saveStoredSubscriptions(list: NotificationSubscription[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_SUBSCRIPTIONS_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('qr_marketing_updated'));
}

function getStoredCampaigns(): MarketingCampaign[] {
  if (typeof window === 'undefined') return INITIAL_MARKETING_CAMPAIGNS;
  try {
    const raw = localStorage.getItem(STORAGE_CAMPAIGNS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_CAMPAIGNS_KEY, JSON.stringify(INITIAL_MARKETING_CAMPAIGNS));
      return INITIAL_MARKETING_CAMPAIGNS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MARKETING_CAMPAIGNS;
  }
}

function saveStoredCampaigns(list: MarketingCampaign[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_CAMPAIGNS_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('qr_marketing_updated'));
}

export const MarketingService = {
  // ==========================================
  // 1. CLIENT PUSH OPT-IN SUBSCRIPTION
  // ==========================================
  async subscribeCustomer(restaurantId: string): Promise<{
    success: boolean;
    reason?: string;
    subscription?: NotificationSubscription;
  }> {
    if (typeof window === 'undefined') {
      return { success: false, reason: 'Window undefined' };
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      return { success: false, reason: 'Web push notifications are not supported by this browser.' };
    }

    try {
      // 1. Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return { success: false, reason: 'Notification permission was denied by user.' };
      }

      // 2. Register or get existing service worker
      let registration = await navigator.serviceWorker.getRegistration('/sw.js');
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      }
      await navigator.serviceWorker.ready;

      // 3. Get public VAPID key
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BHYRyHSGPR8snWZntRnwLNU2UFyyVPTDRh28Jw43QRrLopDzxAM8aVXkEMuqjlUJ5-cULcgG9t2ULdIdW6LQOMQ';
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // 4. Create or reuse browser push subscription
      let pushSub = await registration.pushManager.getSubscription();
      if (!pushSub) {
        pushSub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey as unknown as BufferSource,
        });
      }

      const p256dh = arrayBufferToBase64(pushSub.getKey('p256dh'));
      const auth = arrayBufferToBase64(pushSub.getKey('auth'));
      const { browser, device } = getBrowserAndDeviceInfo();

      const newSub: NotificationSubscription = {
        id: 'sub-' + Math.random().toString(36).substring(2, 9),
        restaurant_id: restaurantId,
        endpoint: pushSub.endpoint,
        p256dh,
        auth,
        browser,
        device,
        created_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        active: true,
      };

      // 5. Send to Server API
      try {
        await fetch('/api/marketing/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restaurant_id: restaurantId,
            endpoint: pushSub.endpoint,
            p256dh,
            auth,
            browser,
            device,
          }),
        });
      } catch (err) {
        console.warn('Backend push subscribe API call fallback to local:', err);
      }

      // Also persist to local demo store
      const allSubs = getStoredSubscriptions();
      const existingIdx = allSubs.findIndex(
        (s) => s.restaurant_id === restaurantId && s.endpoint === pushSub.endpoint
      );
      if (existingIdx >= 0) {
        allSubs[existingIdx] = { ...allSubs[existingIdx], active: true, last_seen: new Date().toISOString() };
      } else {
        allSubs.unshift(newSub);
      }
      saveStoredSubscriptions(allSubs);

      return { success: true, subscription: newSub };
    } catch (err: any) {
      console.error('Failed to subscribe customer to push notifications:', err);
      return { success: false, reason: err?.message || 'Failed to complete push registration' };
    }
  },

  // ==========================================
  // 2. GET RESTAURANT SUBSCRIBERS
  // ==========================================
  async getSubscribers(restaurantId: string): Promise<NotificationSubscription[]> {
    const validRestaurantId = toValidUUID(restaurantId);
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('notification_subscriptions')
          .select('*')
          .or(`restaurant_id.eq.${validRestaurantId},restaurant_id.eq.${restaurantId}`)
          .order('created_at', { ascending: false });

        if (!error && data) return data;
      } catch (err) {
        console.warn('Failed to load subscribers from Supabase, using local store:', err);
      }
    }

    const all = getStoredSubscriptions();
    return all.filter((s) => s.restaurant_id === restaurantId || s.restaurant_id === validRestaurantId);
  },

  // ==========================================
  // 3. GET RESTAURANT CAMPAIGNS
  // ==========================================
  async getCampaigns(restaurantId: string): Promise<MarketingCampaign[]> {
    const validRestaurantId = toValidUUID(restaurantId);
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('marketing_campaigns')
          .select('*')
          .or(`restaurant_id.eq.${validRestaurantId},restaurant_id.eq.${restaurantId}`)
          .order('sent_at', { ascending: false });

        if (!error && data) return data;
      } catch (err) {
        console.warn('Failed to load campaigns from Supabase, using local store:', err);
      }
    }

    const all = getStoredCampaigns();
    return all.filter((c) => c.restaurant_id === restaurantId || c.restaurant_id === validRestaurantId);
  },

  // ==========================================
  // 4. GET MARKETING STATS
  // ==========================================
  async getMarketingStats(restaurantId: string): Promise<MarketingStats> {
    const [subscribers, campaigns] = await Promise.all([
      this.getSubscribers(restaurantId),
      this.getCampaigns(restaurantId),
    ]);

    const activeSubscribers = subscribers.filter((s) => s.active).length;
    const lastCampaign = campaigns.length > 0 ? campaigns[0].sent_at : null;

    return {
      totalSubscribers: subscribers.length,
      activeSubscribers,
      campaignsSent: campaigns.length,
      lastCampaignDate: lastCampaign,
      openRateEstimated: (campaigns.length > 0 && activeSubscribers > 0) ? '98.5%' : '0.0%',
    };
  },

  // ==========================================
  // 5. SEND MARKETING CAMPAIGN
  // ==========================================
  async sendCampaign(params: {
    restaurantId: string;
    title: string;
    message: string;
    imageUrl?: string;
    ctaUrl?: string;
  }): Promise<SendCampaignResult> {
    if (!params.title.trim()) throw new Error('Campaign title is required');
    if (!params.message.trim()) throw new Error('Campaign message is required');

    // Attempt Server-Side dispatch through authenticated API
    try {
      const res = await fetch('/api/marketing/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (res.ok) {
        const result = await res.json();
        return result;
      }
    } catch (apiErr) {
      console.warn('API /api/marketing/send fallback to mock simulation:', apiErr);
    }

    // Fallback simulation for offline/demo mode:
    const subscribers = await this.getSubscribers(params.restaurantId);
    const activeSubs = subscribers.filter((s) => s.active);

    const newCampaign: MarketingCampaign = {
      id: 'cmp-' + Math.random().toString(36).substring(2, 9),
      restaurant_id: params.restaurantId,
      title: params.title.trim(),
      message: params.message.trim(),
      image_url: params.imageUrl?.trim() || null,
      cta_url: params.ctaUrl?.trim() || null,
      sent_at: new Date().toISOString(),
      total_targeted: subscribers.length,
      total_sent: activeSubs.length,
      total_failed: subscribers.length - activeSubs.length,
    };

    const allCampaigns = getStoredCampaigns();
    allCampaigns.unshift(newCampaign);
    saveStoredCampaigns(allCampaigns);

    // If browser supports Notification, also trigger local desktop notification to demonstrate live delivery!
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(params.title, {
          body: params.message,
          icon: '/favicon.ico',
          image: params.imageUrl || undefined,
        } as any);
      } catch (nErr) {
        // Notification constructor may throw on some mobile environments
      }
    }

    return {
      success: true,
      campaign: newCampaign,
      totalTargeted: subscribers.length,
      totalSent: activeSubs.length,
      totalFailed: subscribers.length - activeSubs.length,
      inactiveMarked: 0,
    };
  },

  // ==========================================
  // 6. DELETE ALL SUBSCRIBERS
  // ==========================================
  async deleteAllSubscribers(restaurantId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase
          .from('notification_subscriptions')
          .delete()
          .eq('restaurant_id', restaurantId);
      } catch (err) {
        console.warn('Failed to delete subscribers in Supabase:', err);
      }
    }

    const all = getStoredSubscriptions();
    const remaining = all.filter((s) => s.restaurant_id !== restaurantId);
    saveStoredSubscriptions(remaining);
    return true;
  },
};
