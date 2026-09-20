'use client';

import { createClient, isSupabaseConfigured } from './supabase/client';
import { Announcement, RestaurantNotification, AnnouncementPriority, AnnouncementAudience, Restaurant } from './types';
import { INITIAL_ANNOUNCEMENTS, INITIAL_RESTAURANT_NOTIFICATIONS } from './mock-data';
import { AdminService } from './admin-service';
import { toValidUUID, isValidUUID } from './uuid-utils';

const STORAGE_ANNOUNCEMENTS_KEY = 'qr_saas_announcements_v1';
const STORAGE_NOTIFICATIONS_KEY = 'qr_saas_resto_notifications_v1';

function getStoredAnnouncements(): Announcement[] {
  if (typeof window === 'undefined') return INITIAL_ANNOUNCEMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_ANNOUNCEMENTS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_ANNOUNCEMENTS_KEY, JSON.stringify(INITIAL_ANNOUNCEMENTS));
      return INITIAL_ANNOUNCEMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ANNOUNCEMENTS;
  }
}

function saveStoredAnnouncements(list: Announcement[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_ANNOUNCEMENTS_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('qr_announcements_updated'));
}

function getStoredNotifications(): RestaurantNotification[] {
  if (typeof window === 'undefined') return INITIAL_RESTAURANT_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(INITIAL_RESTAURANT_NOTIFICATIONS));
      return INITIAL_RESTAURANT_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_RESTAURANT_NOTIFICATIONS;
  }
}

function saveStoredNotifications(list: RestaurantNotification[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('qr_notifications_updated'));
}

export const BroadcastService = {
  // ==========================================
  // GET ALL ANNOUNCEMENTS (ADMIN)
  // ==========================================
  async getAnnouncements(): Promise<Announcement[]> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getAnnouncements fallback:', err);
      }
    }

    return getStoredAnnouncements().sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  // ==========================================
  // CREATE & BROADCAST ANNOUNCEMENT (ADMIN)
  // ==========================================
  async createAnnouncement(data: {
    title: string;
    message: string;
    priority?: AnnouncementPriority;
    target_audience?: AnnouncementAudience;
    target_restaurant_id?: string | null;
    target_restaurant_name?: string | null;
    image_url?: string | null;
    cta_label?: string | null;
    cta_url?: string | null;
    scheduled_at?: string | null;
    created_by?: string;
  }): Promise<{ announcement: Announcement; recipientCount: number }> {
    if (!data.title.trim()) throw new Error('Announcement title is required');
    if (!data.message.trim()) throw new Error('Announcement message is required');

    const ancId = crypto.randomUUID();
    const validTargetId = data.target_restaurant_id ? toValidUUID(data.target_restaurant_id) : null;

    const newAnnouncement: Announcement = {
      id: ancId,
      title: data.title.trim(),
      message: data.message.trim(),
      priority: data.priority || 'normal',
      target_audience: data.target_audience || 'all',
      target_restaurant_id: validTargetId,
      target_restaurant_name: data.target_restaurant_name || null,
      image_url: data.image_url?.trim() || null,
      cta_label: data.cta_label?.trim() || null,
      cta_url: data.cta_url?.trim() || null,
      scheduled_at: data.scheduled_at || null,
      created_at: new Date().toISOString(),
      created_by: data.created_by || 'Super Admin',
      total_sent: 0,
      total_read: 0,
    };

    // 1. Determine target restaurants
    const allTenants = await AdminService.getAllTenants();
    let targetTenants: Restaurant[] = [];

    switch (newAnnouncement.target_audience) {
      case 'trial':
        targetTenants = allTenants.filter((t) => t.subscription_status === 'trialing');
        break;
      case 'premium':
        targetTenants = allTenants.filter((t) => t.subscription_status === 'active');
        break;
      case 'expired':
        targetTenants = allTenants.filter((t) => t.subscription_status === 'past_due' || t.subscription_status === 'inactive');
        break;
      case 'specific':
        targetTenants = allTenants.filter((t) => toValidUUID(t.id) === validTargetId);
        break;
      case 'all':
      default:
        targetTenants = allTenants;
        break;
    }

    newAnnouncement.total_sent = targetTenants.length;

    // 2. Persist to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.from('announcements').insert({
          id: ancId,
          title: newAnnouncement.title,
          message: newAnnouncement.message,
          priority: newAnnouncement.priority,
          target_audience: newAnnouncement.target_audience,
          target_restaurant_id: validTargetId,
          image_url: newAnnouncement.image_url,
          cta_label: newAnnouncement.cta_label,
          cta_url: newAnnouncement.cta_url,
          created_by: newAnnouncement.created_by,
        });

        if (targetTenants.length > 0) {
          const rows = targetTenants.map((t) => ({
            id: crypto.randomUUID(),
            restaurant_id: toValidUUID(t.id),
            announcement_id: ancId,
            read: false,
          }));
          await supabase.from('restaurant_notifications').insert(rows);
        }
      } catch (err) {
        console.warn('Supabase broadcast persistence error:', err);
      }
    }

    // 3. Fallback / local store persistence
    const allAnnouncements = getStoredAnnouncements();
    allAnnouncements.unshift(newAnnouncement);
    saveStoredAnnouncements(allAnnouncements);

    // 4. Fan out Restaurant Notifications locally
    const allNotifications = getStoredNotifications();
    for (const resto of targetTenants) {
      const notif: RestaurantNotification = {
        id: 'notif-' + Math.random().toString(36).substring(2, 9),
        restaurant_id: resto.id,
        announcement_id: newAnnouncement.id,
        announcement: newAnnouncement,
        read: false,
        read_at: null,
        created_at: new Date().toISOString(),
      };
      allNotifications.unshift(notif);
    }
    saveStoredNotifications(allNotifications);

    // 5. Trigger Real-Time Online Dispatch Event for Toast Notification!
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('qr_announcement_broadcast', {
          detail: {
            announcement: newAnnouncement,
            targetRestaurants: targetTenants.map((t) => t.id),
          },
        })
      );
    }

    return { announcement: newAnnouncement, recipientCount: targetTenants.length };
  },

  // ==========================================
  // DELETE ANNOUNCEMENT (ADMIN)
  // ==========================================
  async deleteAnnouncement(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const validId = toValidUUID(id);
        await supabase.from('announcements').delete().or(`id.eq.${id},id.eq.${validId}`);
      } catch (err) {
        console.warn('Supabase delete announcement error:', err);
      }
    }

    const allAnnouncements = getStoredAnnouncements();
    const filteredAnnouncements = allAnnouncements.filter((a) => a.id !== id);
    saveStoredAnnouncements(filteredAnnouncements);

    // Cascade delete linked notifications
    const allNotifications = getStoredNotifications();
    const filteredNotifications = allNotifications.filter((n) => n.announcement_id !== id);
    saveStoredNotifications(filteredNotifications);

    return true;
  },

  // ==========================================
  // GET RESTAURANT NOTIFICATIONS (OWNER)
  // ==========================================
  async getRestaurantNotifications(restaurantId: string): Promise<RestaurantNotification[]> {
    const validRestaurantId = toValidUUID(restaurantId);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('restaurant_notifications')
          .select('*, announcement:announcements(*)')
          .or(`restaurant_id.eq.${restaurantId},restaurant_id.eq.${validRestaurantId}`)
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getRestaurantNotifications fallback:', err);
      }
    }

    const all = getStoredNotifications();
    return all.filter((n) => n.restaurant_id === restaurantId || n.restaurant_id === validRestaurantId);
  },

  // ==========================================
  // GET UNREAD COUNT (FOR BELL BADGE)
  // ==========================================
  async getUnreadCount(restaurantId: string): Promise<number> {
    const list = await this.getRestaurantNotifications(restaurantId);
    return list.filter((n) => !n.read).length;
  },

  // ==========================================
  // MARK NOTIFICATION AS READ (OWNER)
  // ==========================================
  async markAsRead(notificationId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const validId = toValidUUID(notificationId);
        await supabase
          .from('restaurant_notifications')
          .update({ read: true, read_at: new Date().toISOString() })
          .or(`id.eq.${notificationId},id.eq.${validId}`);
      } catch (err) {
        console.warn('Supabase markAsRead error:', err);
      }
    }

    const all = getStoredNotifications();
    const idx = all.findIndex((n) => n.id === notificationId);
    if (idx !== -1) {
      all[idx] = { ...all[idx], read: true, read_at: new Date().toISOString() };
      saveStoredNotifications(all);

      // Increment read count on announcement
      const ancId = all[idx].announcement_id;
      const allAnc = getStoredAnnouncements();
      const ancIdx = allAnc.findIndex((a) => a.id === ancId);
      if (ancIdx !== -1) {
        allAnc[ancIdx] = {
          ...allAnc[ancIdx],
          total_read: (allAnc[ancIdx].total_read || 0) + 1,
        };
        saveStoredAnnouncements(allAnc);
      }
    }
    return true;
  },

  // ==========================================
  // MARK ALL AS READ (OWNER)
  // ==========================================
  async markAllAsRead(restaurantId: string): Promise<boolean> {
    const validRestaurantId = toValidUUID(restaurantId);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase
          .from('restaurant_notifications')
          .update({ read: true, read_at: new Date().toISOString() })
          .or(`restaurant_id.eq.${restaurantId},restaurant_id.eq.${validRestaurantId}`);
      } catch (err) {
        console.warn('Supabase markAllAsRead error:', err);
      }
    }

    const all = getStoredNotifications();
    let updatedCount = 0;
    const updated = all.map((n) => {
      if ((n.restaurant_id === restaurantId || n.restaurant_id === validRestaurantId) && !n.read) {
        updatedCount++;
        return { ...n, read: true, read_at: new Date().toISOString() };
      }
      return n;
    });
    saveStoredNotifications(updated);
    return true;
  },

  // ==========================================
  // DELETE NOTIFICATION (OWNER)
  // ==========================================
  async deleteNotification(notificationId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const validId = toValidUUID(notificationId);
        await supabase
          .from('restaurant_notifications')
          .delete()
          .or(`id.eq.${notificationId},id.eq.${validId}`);
      } catch (err) {
        console.warn('Supabase deleteNotification error:', err);
      }
    }

    const all = getStoredNotifications();
    const filtered = all.filter((n) => n.id !== notificationId);
    saveStoredNotifications(filtered);
    return true;
  },
};
