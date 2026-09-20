'use client';

import React, { useState, useEffect } from 'react';
import {
  Send,
  Radio,
  Clock,
  AlertCircle,
  CheckCircle2,
  Bell,
  Trash2,
  Eye,
  Calendar,
  Sparkles,
  Users,
  Building2,
  ExternalLink,
  Smartphone,
  Check,
  X,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Announcement, AnnouncementPriority, AnnouncementAudience, Restaurant } from '@/lib/types';
import { BroadcastService } from '@/lib/broadcast-service';
import { AdminService } from '@/lib/admin-service';
import { useToast } from '@/components/ui/toast';

const PRESETS = [
  {
    icon: '🚀',
    label: 'New Feature Released',
    title: '🚀 New Feature Released: Web Push Marketing Hub',
    message: 'You can now broadcast rich push notifications to diners who scanned your QR menu and opted in. Check the new Marketing section in your dashboard!',
    priority: 'important' as AnnouncementPriority,
    audience: 'all' as AnnouncementAudience,
    cta_label: 'Open Marketing Hub',
    cta_url: '/dashboard',
  },
  {
    icon: '⚠',
    label: 'Scheduled Maintenance',
    title: '⚠ Scheduled System Maintenance Notice',
    message: 'Routine infrastructure maintenance is scheduled this Sunday from 03:00 AM to 03:15 AM IST. Dine-in guest menus will continue functioning offline.',
    priority: 'critical' as AnnouncementPriority,
    audience: 'all' as AnnouncementAudience,
    cta_label: 'System Status',
    cta_url: '/dashboard',
  },
  {
    icon: '🎉',
    label: 'Diwali Discount',
    title: '🎉 Festive Celebration: Special Annual Renewal Savings!',
    message: 'Celebrate Diwali with 20% off all Pro Hospitality & Heritage annual plans. Use voucher code DIWALI20 at checkout before midnight.',
    priority: 'normal' as AnnouncementPriority,
    audience: 'premium' as AnnouncementAudience,
    cta_label: 'Claim Discount',
    cta_url: '/dashboard',
  },
  {
    icon: '📢',
    label: 'Payment Reminder',
    title: '📢 Subscription Renewal Due in 3 Days',
    message: 'Your restaurant subscription billing cycle renews shortly. Please ensure your payment method is active to prevent any QR menu interruption.',
    priority: 'important' as AnnouncementPriority,
    audience: 'trial' as AnnouncementAudience,
    cta_label: 'Review Billing',
    cta_url: '/dashboard',
  },
  {
    icon: '🎁',
    label: 'New AI Features',
    title: '🎁 AI Sommelier & Menu Engineering Now Live',
    message: 'Supercharge your beverage pairings and automatic dish recommendation engine using our next-generation AI dining intelligence.',
    priority: 'normal' as AnnouncementPriority,
    audience: 'all' as AnnouncementAudience,
    cta_label: 'Try AI Features',
    cta_url: '/dashboard',
  },
];

export function BroadcastCenter() {
  const { success, error, warning } = useToast();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tenants, setTenants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('normal');
  const [audience, setAudience] = useState<AnnouncementAudience>('all');
  const [targetRestaurantId, setTargetRestaurantId] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');

  // Modals & Preview
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [ancList, tList] = await Promise.all([
        BroadcastService.getAnnouncements(),
        AdminService.getAllTenants(),
      ]);
      setAnnouncements(ancList);
      setTenants(tList);
      if (tList.length > 0 && !targetRestaurantId) {
        setTargetRestaurantId(tList[0].id);
      }
    } catch (err) {
      console.error('Failed to load broadcast center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdated = () => loadData();
    window.addEventListener('qr_announcements_updated', handleUpdated);
    return () => window.removeEventListener('qr_announcements_updated', handleUpdated);
  }, []);

  const handleApplyPreset = (preset: (typeof PRESETS)[0]) => {
    setTitle(preset.title);
    setMessage(preset.message);
    setPriority(preset.priority);
    setAudience(preset.audience);
    setCtaLabel(preset.cta_label);
    setCtaUrl(preset.cta_url);
  };

  const handleSendNow = async () => {
    if (!title.trim()) {
      error('Title required', 'Please enter a broadcast announcement title.');
      return;
    }
    if (!message.trim()) {
      error('Message required', 'Please enter announcement message content.');
      return;
    }

    setIsSending(true);
    try {
      const targetResto = tenants.find((t) => t.id === targetRestaurantId);

      const result = await BroadcastService.createAnnouncement({
        title: title.trim(),
        message: message.trim(),
        priority,
        target_audience: audience,
        target_restaurant_id: audience === 'specific' ? targetRestaurantId : null,
        target_restaurant_name: audience === 'specific' ? targetResto?.name : null,
        image_url: imageUrl.trim() || null,
        cta_label: ctaLabel.trim() || null,
        cta_url: ctaUrl.trim() || null,
        scheduled_at: scheduledAt || null,
      });

      success(
        'Broadcast Dispatched!',
        `Successfully delivered to ${result.recipientCount} restaurant dashboard${result.recipientCount === 1 ? '' : 's'}.`
      );

      // Reset form
      setTitle('');
      setMessage('');
      setImageUrl('');
      setCtaLabel('');
      setCtaUrl('');
      setScheduledAt('');
      setShowPreviewModal(false);

      await loadData();
    } catch (err: any) {
      error('Dispatch Error', err?.message || 'Could not send announcement.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await BroadcastService.deleteAnnouncement(id);
      success('Announcement Deleted', 'Removed announcement from history and linked notifications.');
      setDeletingId(null);
      await loadData();
    } catch (err: any) {
      error('Delete Failed', err?.message);
    }
  };

  const getPriorityBadge = (p: AnnouncementPriority) => {
    switch (p) {
      case 'critical':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
            Critical Notice
          </span>
        );
      case 'important':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
            Important
          </span>
        );
      case 'normal':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Normal Update
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-stone-900">
              Admin Broadcast Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              Live In-App Dispatch
            </span>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Publish announcements, maintenance alerts, and offers directly into restaurant owner dashboards.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={loading}
          className="rounded-xl border-stone-200 text-stone-700 font-bold gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Two-Column Layout: Message Composer & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Composer Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900">Compose Broadcast Message</h3>
            <span className="text-xs text-stone-400">Step 1 of 2</span>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
              Quick Templates
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200/80 hover:border-amber-400 hover:bg-amber-50/50 text-xs font-semibold text-stone-700 transition-all text-left"
                >
                  <span>{preset.icon}</span>
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 pt-2">
            {/* Title */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Announcement Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 🚀 New Feature Released: Web Push Marketing"
                className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
            </div>

            {/* Message */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Announcement Message <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Detailed explanation, instructions, or discount code..."
                className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
              />
            </div>

            {/* Priority & Audience Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['normal', 'important', 'critical'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-2 px-2 text-center rounded-xl text-xs font-bold capitalize transition-all border ${
                        priority === p
                          ? p === 'critical'
                            ? 'bg-red-600 text-white border-red-600 shadow-xs'
                            : p === 'important'
                            ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs'
                            : 'bg-[#1f4e47] text-white border-[#1f4e47] shadow-xs'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audience */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1.5">
                  Target Audience
                </label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as AnnouncementAudience)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">All Restaurants ({tenants.length})</option>
                  <option value="trial">Trial Users Only</option>
                  <option value="premium">Premium Active Outlets</option>
                  <option value="expired">Expired / Past Due</option>
                  <option value="specific">Specific Single Restaurant</option>
                </select>
              </div>
            </div>

            {/* Specific Restaurant Selector if applicable */}
            {audience === 'specific' && (
              <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Choose Target Restaurant Outlet
                </label>
                <select
                  value={targetRestaurantId}
                  onChange={(e) => setTargetRestaurantId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-800"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.slug})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Optional Banner Image URL */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Optional Banner Photo URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... (optional)"
                  className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <ImageIcon className="w-4 h-4 text-stone-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Optional Call to Action Button */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Optional CTA Button Label
                </label>
                <input
                  type="text"
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  placeholder="e.g. Explore Features"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Button Target URL
                </label>
                <input
                  type="text"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder="/dashboard"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Action Dispatch Buttons */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreviewModal(true)}
              className="rounded-xl text-xs font-bold gap-1.5 border-stone-200 text-stone-700"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Card</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={handleSendNow}
                disabled={!title.trim() || !message.trim() || isSending}
                className="rounded-xl bg-[#1f4e47] hover:bg-[#183e38] text-white font-bold text-xs gap-2 px-6 h-11 shadow-sm"
              >
                <Send className="w-4 h-4 text-[#efa736]" />
                <span>{isSending ? 'Broadcasting...' : 'Send Now'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Live Drawer Card Mockup */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-stone-900">Owner Dashboard Preview</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Notification Drawer
            </span>
          </div>

          <p className="text-xs text-stone-500">
            How this message will appear inside the restaurant owner&#39;s notification drawer:
          </p>

          {/* Rendered Notification Card */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#1f4e47] flex items-center justify-center text-[#efa736] text-xs font-black">
                  BP
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-900 block">
                    Platform Announcement
                  </span>
                  <span className="text-[10px] text-stone-400">Just now</span>
                </div>
              </div>
              {getPriorityBadge(priority)}
            </div>

            <div>
              <h4 className="text-sm font-black text-stone-900 leading-tight">
                {title || '🚀 New Feature Released: Web Push Marketing'}
              </h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                {message ||
                  'You can now broadcast instant browser push notifications to diners who scanned your table QR menu!'}
              </p>
            </div>

            {imageUrl && (
              <div className="rounded-xl overflow-hidden max-h-36 border border-stone-200">
                <img
                  src={imageUrl}
                  alt="Announcement banner"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {ctaLabel && (
              <div className="pt-1">
                <button
                  type="button"
                  className="w-full py-2 rounded-xl bg-[#efa736] text-stone-950 text-xs font-bold text-center"
                >
                  {ctaLabel} &rarr;
                </button>
              </div>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Real-Time Online Toast</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Online restaurant owners will receive an instant popup alert on their screen. Offline owners will see an unread badge on their bell icon upon logging in.
            </p>
          </div>
        </div>
      </div>

      {/* Broadcast History Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900">Broadcast History</h3>
            <p className="text-xs text-stone-500">Log of announcements sent to restaurant outlets</p>
          </div>
          <span className="text-xs font-bold text-stone-400">
            {announcements.length} Announcement{announcements.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="overflow-x-auto border border-stone-200/70 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 text-stone-500 font-bold uppercase tracking-wider text-[10px] border-b border-stone-200/80">
              <tr>
                <th className="py-3 px-4">Title &amp; Content</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Target Audience</th>
                <th className="py-3 px-4">Delivery &amp; Reads</th>
                <th className="py-3 px-4">Date Sent</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {announcements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-stone-400">
                    No announcements broadcast yet.
                  </td>
                </tr>
              ) : (
                announcements.map((anc) => (
                  <tr key={anc.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-stone-900 truncate">{anc.title}</div>
                      <div className="text-[11px] text-stone-500 truncate mt-0.5">{anc.message}</div>
                    </td>
                    <td className="py-3.5 px-4">{getPriorityBadge(anc.priority)}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-stone-800 capitalize">
                        {anc.target_audience === 'all'
                          ? 'All Outlets'
                          : anc.target_audience === 'specific'
                          ? `Single: ${anc.target_restaurant_name || 'Outlet'}`
                          : `${anc.target_audience} Outlets`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-emerald-700 font-bold">
                        {anc.total_sent || 0} delivered
                      </span>
                      {anc.total_read !== undefined && (
                        <span className="text-stone-400 text-[10px] ml-1.5">
                          ({anc.total_read} read)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-stone-500 whitespace-nowrap">
                      {new Date(anc.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteAnnouncement(anc.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-100 transition-colors"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Full Preview
              </span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <img src="/images/serveos-icon.png" alt="ServeOS" className="h-4 w-auto object-contain" />
                  <span className="text-xs font-bold text-[#1b3b2f]">ServeOS Admin Broadcast</span>
                </div>
                {getPriorityBadge(priority)}
              </div>
              <h4 className="text-base font-black text-stone-900">{title || 'No Title'}</h4>
              <p className="text-xs text-stone-600">{message || 'No Message'}</p>
              {imageUrl && (
                <div className="rounded-xl overflow-hidden max-h-36 border border-stone-200">
                  <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
              {ctaLabel && (
                <button
                  type="button"
                  className="w-full py-2 rounded-xl bg-[#efa736] text-stone-950 text-xs font-bold text-center"
                >
                  {ctaLabel}
                </button>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowPreviewModal(false)}
                className="rounded-xl text-xs font-bold"
              >
                Close
              </Button>
              <Button
                onClick={handleSendNow}
                disabled={isSending}
                className="rounded-xl bg-[#1f4e47] text-white text-xs font-bold"
              >
                Send Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
