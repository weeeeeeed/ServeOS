'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  ExternalLink,
  Sparkles,
  Info,
  CheckCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RestaurantNotification, AnnouncementPriority } from '@/lib/types';
import { BroadcastService } from '@/lib/broadcast-service';
import { useToast } from '@/components/ui/toast';

interface NotificationDrawerProps {
  restaurantId: string;
}

export function NotificationDrawer({ restaurantId }: NotificationDrawerProps) {
  const { toast, success, warning, error, info } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<RestaurantNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    if (!restaurantId) return;
    try {
      const list = await BroadcastService.getRestaurantNotifications(restaurantId);
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.read).length);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    const handleUpdated = () => loadNotifications();
    window.addEventListener('qr_notifications_updated', handleUpdated);

    const handleBroadcast = (event: Event) => {
      const customEvent = event as CustomEvent<{
        announcement: any;
        targetRestaurants: string[];
      }>;
      const detail = customEvent.detail;
      if (!detail) return;

      const isTargeted =
        !detail.targetRestaurants ||
        detail.targetRestaurants.length === 0 ||
        detail.targetRestaurants.includes(restaurantId);

      if (isTargeted) {
        const anc = detail.announcement;
        if (anc.priority === 'critical') {
          error(`${anc.title}`, anc.message);
        } else if (anc.priority === 'important') {
          warning(`${anc.title}`, anc.message);
        } else {
          info(`${anc.title}`, anc.message);
        }
        loadNotifications();
      }
    };

    window.addEventListener('qr_announcement_broadcast', handleBroadcast);

    return () => {
      window.removeEventListener('qr_notifications_updated', handleUpdated);
      window.removeEventListener('qr_announcement_broadcast', handleBroadcast);
    };
  }, [restaurantId]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await BroadcastService.markAsRead(id);
    await loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await BroadcastService.markAllAsRead(restaurantId);
    success('All Caught Up', 'Marked all announcements as read.');
    await loadNotifications();
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await BroadcastService.deleteNotification(id);
    await loadNotifications();
  };

  const formatElapsed = (isoDate: string) => {
    const elapsedMs = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(elapsedMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2.5 rounded-2xl bg-white border border-[#e6e2da] hover:bg-[#faf8f5] text-[#556960] hover:text-[#1b3b2f] shadow-2xs transition-colors"
        title="Announcements & Alerts"
        type="button"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#1b3b2f] text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/40 backdrop-blur-2xs animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setIsOpen(false)}
          />

          <aside className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#faf8f5] border-l border-[#e6e2da] shadow-2xl flex flex-col justify-between">
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#e6e2da] flex items-center justify-between bg-white/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#eef4f0] text-[#1b3b2f] flex items-center justify-center">
                    <Bell className="w-4 h-4 text-[#3a7d5c]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#1b3b2f]">
                      ServeOS Notifications
                    </h3>
                    <p className="text-[11px] text-[#556960]">
                      {unreadCount} unread system broadcasts
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-[#3a7d5c] hover:underline font-semibold"
                      type="button"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-[#eef4f0] text-[#85988e] hover:text-[#1b3b2f]"
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="text-center py-20 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#eef4f0] text-[#3a7d5c] flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <p className="font-serif font-bold text-sm text-[#1b3b2f]">You are all caught up</p>
                    <p className="text-xs text-[#85988e] max-w-xs mx-auto">
                      System updates, platform notices, and kitchen bulletins will appear here.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isUnread = !notif.read;
                    return (
                      <div
                        key={notif.id}
                        onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                        className={`p-4 rounded-2xl border transition-all ${
                          isUnread
                            ? 'bg-white border-[#cbe0d3] shadow-2xs'
                            : 'bg-white/60 border-[#e6e2da] opacity-80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-[#3a7d5c] shrink-0" />
                            )}
                            <h4 className="font-serif font-bold text-xs text-[#1b3b2f]">
                              {notif.announcement?.title || "System Announcement"}
                            </h4>
                          </div>
                          <span className="text-[10px] text-[#85988e] shrink-0 font-sans">
                            {formatElapsed(notif.created_at)}
                          </span>
                        </div>

                        <p className="text-xs text-[#556960] mt-1.5 leading-relaxed">
                          {notif.announcement?.message || ""}
                        </p>

                        <div className="mt-3 pt-2 border-t border-[#f0ede6] flex items-center justify-between text-[11px]">
                          <span className="text-[10px] text-[#85988e] uppercase tracking-wider font-semibold">
                            {notif.announcement?.priority || "normal"}
                          </span>
                          <button
                            onClick={(e) => handleDelete(notif.id, e)}
                            className="text-[#85988e] hover:text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-[#e6e2da] bg-white/70 text-center text-[11px] text-[#85988e]">
                ServeOS Realtime Notification Protocol
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
