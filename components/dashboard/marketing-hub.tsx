'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Send,
  TrendingUp,
  Clock,
  Sparkles,
  Smartphone,
  Monitor,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Bell,
  ExternalLink,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Zap,
  ChevronRight,
  Info,
  X,
  Laptop,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Restaurant, NotificationSubscription, MarketingCampaign, MarketingStats, SendCampaignResult } from '@/lib/types';
import { MarketingService } from '@/lib/marketing-service';
import { useToast } from '@/components/ui/toast';

interface MarketingHubProps {
  restaurant: Restaurant;
}

const TEMPLATES = [
  {
    icon: '🍕',
    label: '20% OFF Pizza Today',
    title: '🍕 20% OFF All Pizzas Today Only!',
    message: 'Craving cheesy goodness? Show this notification at checkout or order online to claim your 20% discount!',
  },
  {
    icon: '🎉',
    label: 'New Weekend Menu',
    title: '🎉 Fresh Flavors: New Weekend Specials!',
    message: 'Our head chef just dropped 5 exclusive seasonal creations. Check them out on our live digital menu now.',
  },
  {
    icon: '🍔',
    label: 'Happy Hour: 5 PM - 7 PM',
    title: '🍔 Happy Hour Kicks Off at 5 PM!',
    message: '2-for-1 craft draft beers and half-price artisan sliders until 7 PM. Bring your friends and save your spot!',
  },
  {
    icon: '⭐',
    label: "Chef's Special Tonight",
    title: "⭐ Chef's Signature Dish Back Tonight!",
    message: 'Limited 30 portions available tonight. Dine in or reserve early before we sell out for the evening.',
  },
];

export function MarketingHub({ restaurant }: MarketingHubProps) {
  const { toast, success, error, warning } = useToast();

  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<NotificationSubscription[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [stats, setStats] = useState<MarketingStats>({
    totalSubscribers: 0,
    activeSubscribers: 0,
    campaignsSent: 0,
    lastCampaignDate: null,
    openRateEstimated: '0.0%',
  });

  // Compose Campaign State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [ctaUrl, setCtaUrl] = useState(`/r/${restaurant.slug || 'menu'}`);
  const [imageUrl, setImageUrl] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  // Confirmation & Sending States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sendResult, setSendResult] = useState<SendCampaignResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Settings Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [marketingEnabled, setMarketingEnabled] = useState(restaurant.marketing_enabled ?? true);

  const loadMarketingData = async () => {
    if (!restaurant?.id) return;
    try {
      const [subs, cmps, st] = await Promise.all([
        MarketingService.getSubscribers(restaurant.id),
        MarketingService.getCampaigns(restaurant.id),
        MarketingService.getMarketingStats(restaurant.id),
      ]);
      setSubscribers(subs);
      setCampaigns(cmps);
      setStats(st);
    } catch (err) {
      console.error('Failed to load marketing hub data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketingData();
  }, [restaurant.id]);

  // Apply quick template
  const handleApplyTemplate = (tmpl: (typeof TEMPLATES)[0]) => {
    setTitle(tmpl.title);
    setMessage(tmpl.message);
  };

  // Cooldown check (warn if sent within 1 hour)
  const isRecentBlast = useMemo(() => {
    if (!stats.lastCampaignDate) return false;
    const lastTime = new Date(stats.lastCampaignDate).getTime();
    const now = Date.now();
    return now - lastTime < 60 * 60 * 1000;
  }, [stats.lastCampaignDate]);

  // Handle Send Campaign
  const handleExecuteSend = async () => {
    if (!title.trim()) {
      error('Title required', 'Please enter a notification headline.');
      return;
    }
    if (!message.trim()) {
      error('Message required', 'Please enter a message body for your diners.');
      return;
    }

    setShowConfirmModal(false);
    setIsSending(true);
    setSendProgress(15);

    try {
      const progressTimer = setInterval(() => {
        setSendProgress((p) => (p < 85 ? p + 25 : p));
      }, 250);

      const result = await MarketingService.sendCampaign({
        restaurantId: restaurant.id,
        title,
        message,
        imageUrl: imageUrl.trim() || undefined,
        ctaUrl: ctaUrl.trim() || undefined,
      });

      clearInterval(progressTimer);
      setSendProgress(100);

      setSendResult(result);
      setShowResultModal(true);
      success('Campaign Dispatched!', `Sent push notification to ${result.totalSent} diner devices.`);

      // Reset form
      setTitle('');
      setMessage('');
      setImageUrl('');

      // Refresh stats
      await loadMarketingData();
    } catch (err: any) {
      error('Dispatch Failed', err?.message || 'Could not broadcast push notification.');
    } finally {
      setIsSending(false);
      setSendProgress(0);
    }
  };

  // Handle Purge Subscribers
  const handleDeleteAllSubscribers = async () => {
    setIsDeleting(true);
    try {
      await MarketingService.deleteAllSubscribers(restaurant.id);
      success('Subscribers Cleared', 'All opted-in tokens have been safely removed.');
      setShowDeleteModal(false);
      await loadMarketingData();
    } catch (err: any) {
      error('Error', err?.message || 'Could not remove subscribers.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Self-Test push notification
  const handleSendSelfTest = async () => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) {
      warning('Browser Unsupported', 'Web push notifications are not supported by this browser.');
      return;
    }

    try {
      if (Notification.permission !== 'granted') {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') {
          warning('Permission Denied', 'Please allow notifications in your browser address bar.');
          return;
        }
      }

      new Notification(title || `${restaurant.name}: Test Notification`, {
        body: message || 'This is how your diners will receive promotional alerts on their devices!',
        icon: '/favicon.ico',
        image: imageUrl || undefined,
      } as any);
      success('Test Notification Sent', 'Check your device notification banner!');
    } catch (err: any) {
      error('Preview Error', err?.message || 'Failed to trigger local notification preview.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e6e2da] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold tracking-tight text-[#1b3b2f]">
              Customer Push Marketing
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200/60">
              <Sparkles className="w-3.5 h-3.5 text-[#3a7d5c]" />
              Web Push RFC 8291
            </span>
          </div>
          <p className="text-sm text-[#556960] mt-1">
            Broadcast instantaneous lock-screen and desktop push promotions to diners who visited your QR menu.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMarketingData}
            disabled={loading}
            className="rounded-xl border-[#e6e2da] text-stone-700 hover:bg-[#f4f1eb] font-semibold gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setMarketingEnabled(!marketingEnabled)}
            className={`rounded-xl font-semibold gap-2 ${
              marketingEnabled
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                : 'border-[#e6e2da] bg-[#f4f1eb] text-stone-600 hover:bg-stone-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${marketingEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
            {marketingEnabled ? 'QR Opt-in Active' : 'QR Opt-in Paused'}
          </Button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Subscribers */}
        <div className="bg-white rounded-3xl p-5 border border-[#e6e2da] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#eef4f0] flex items-center justify-center text-[#1b3b2f] shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#85988e] uppercase tracking-wider">Subscribed Diners</p>
            <h2 className="text-2xl font-black text-[#1b3b2f] tracking-tight mt-0.5">
              {stats.activeSubscribers}
              <span className="text-xs font-medium text-[#85988e] ml-1.5 font-sans">
                / {stats.totalSubscribers} total
              </span>
            </h2>
            <p className="text-[11px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              100% Opted-in via QR
            </p>
          </div>
        </div>

        {/* Campaigns Sent */}
        <div className="bg-white rounded-3xl p-5 border border-[#e6e2da] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
            <Send className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#85988e] uppercase tracking-wider">Campaigns Sent</p>
            <h2 className="text-2xl font-black text-[#1b3b2f] tracking-tight mt-0.5">
              {stats.campaignsSent}
            </h2>
            <p className="text-[11px] text-[#556960] font-medium mt-0.5">
              Across all channels
            </p>
          </div>
        </div>

        {/* Delivery Rate */}
        <div className="bg-white rounded-3xl p-5 border border-[#e6e2da] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#85988e] uppercase tracking-wider">Delivery Rate</p>
            <h2 className="text-2xl font-black text-[#1b3b2f] tracking-tight mt-0.5">
              {stats.openRateEstimated}
            </h2>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              Direct device delivery
            </p>
          </div>
        </div>

        {/* Last Campaign */}
        <div className="bg-white rounded-3xl p-5 border border-[#e6e2da] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#f4f1eb] flex items-center justify-center text-stone-700 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#85988e] uppercase tracking-wider">Last Blast</p>
            <h2 className="text-sm font-bold text-[#162820] tracking-tight mt-1 truncate">
              {stats.lastCampaignDate
                ? new Date(stats.lastCampaignDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'No campaigns yet'}
            </h2>
            <p className="text-[11px] text-[#85988e] font-medium mt-0.5">
              {isRecentBlast ? 'Sent within 1 hr' : 'Ready to broadcast'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Two-Column Studio: Composer + Live Device Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Campaign Composer (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-[#e6e2da] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#eef4f0] flex items-center justify-center text-[#3a7d5c]">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-[#1b3b2f]">Create Push Campaign</h3>
                <p className="text-xs text-[#556960]">Draft your message or click a one-tap template</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSendSelfTest}
              className="text-xs font-serif font-bold text-[#1b3b2f] hover:text-[#122820] hover:bg-[#eef4f0] rounded-xl gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              Test on Device
            </Button>
          </div>

          {/* Quick Template Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
              Quick Templates
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="flex items-center gap-2 p-2.5 rounded-2xl border border-[#e6e2da]/90 hover:border-amber-400 hover:bg-[#eef4f0]/50 transition-all text-left group"
                >
                  <span className="text-lg p-1 rounded-lg bg-[#f4f1eb] group-hover:bg-white transition-colors">
                    {tmpl.icon}
                  </span>
                  <span className="text-xs font-bold text-[#162820] group-hover:text-stone-950 truncate">
                    {tmpl.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-stone-700">
                  Notification Title <span className="text-red-500">*</span>
                </label>
                <span className={`text-[11px] font-semibold ${title.length > 40 ? 'text-[#3a7d5c]' : 'text-[#85988e]'}`}>
                  {title.length}/60 chars (recommended ~35)
                </span>
              </div>
              <input
                type="text"
                value={title}
                maxLength={60}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 🍕 20% OFF Pizza Today Only!"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#faf8f5] border border-[#e6e2da] text-sm font-medium text-[#1b3b2f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
              />
            </div>

            {/* Message Body */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-stone-700">
                  Message Body <span className="text-red-500">*</span>
                </label>
                <span className={`text-[11px] font-semibold ${message.length > 120 ? 'text-[#3a7d5c]' : 'text-[#85988e]'}`}>
                  {message.length}/160 chars
                </span>
              </div>
              <textarea
                rows={3}
                value={message}
                maxLength={160}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Treat yourself to artisan sourdough pizzas with 20% off all day. Show this alert to your server or order via your phone!"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#faf8f5] border border-[#e6e2da] text-sm font-medium text-[#1b3b2f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all resize-none"
              />
            </div>

            {/* Target URL */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-stone-700">
                  Target Menu Link (Click Action)
                </label>
                <span className="text-[11px] text-[#85988e]">Opens when diner taps notification</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  placeholder={`/r/${restaurant.slug || 'menu'}`}
                  className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-[#faf8f5] border border-[#e6e2da] text-sm font-medium text-[#1b3b2f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-mono text-xs"
                />
                <ExternalLink className="w-4 h-4 text-[#85988e] absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Image Banner URL */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-stone-700">
                  Rich Banner Image URL (Optional)
                </label>
                <span className="text-[11px] text-[#85988e]">Shows big photo banner</span>
              </div>
              <div className="relative">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-... (optional banner)"
                  className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-[#faf8f5] border border-[#e6e2da] text-sm font-medium text-[#1b3b2f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-mono text-xs"
                />
                <ImageIcon className="w-4 h-4 text-[#85988e] absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Cooldown Warning Notice if needed */}
          {isRecentBlast && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-[#3a7d5c] shrink-0 mt-0.5" />
              <div className="text-xs text-[#122820]">
                <p className="font-bold">Recent campaign sent within the last hour</p>
                <p className="text-[11px] text-[#1b3b2f] mt-0.5">
                  To keep diner unsubscribe rates low, we suggest leaving 24-48 hours between marketing blasts.
                </p>
              </div>
            </div>
          )}

          {/* Action Dispatch Button */}
          <div className="pt-2">
            <Button
              onClick={() => setShowConfirmModal(true)}
              disabled={!title.trim() || !message.trim() || stats.activeSubscribers === 0 || isSending}
              className="w-full h-12 rounded-2xl bg-[#1f4e47] hover:bg-[#183e38] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 group"
            >
              <Send className="w-4 h-4 text-[#1b3b2f] group-hover:translate-x-0.5 transition-transform" />
              <span>
                Broadcast to {stats.activeSubscribers} Subscribed Diner{stats.activeSubscribers === 1 ? '' : 's'}
              </span>
            </Button>
            {stats.activeSubscribers === 0 && (
              <p className="text-center text-xs text-[#85988e] mt-2">
                No active subscribers yet. Opt-in using your QR menu on a phone to test!
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Live Notification Device Preview (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#e6e2da] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#f0ede6] pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-serif font-bold text-[#1b3b2f]">Live Device Preview</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Real-Time
              </span>
            </div>

            {/* Device Switcher Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-[#f4f1eb] border border-[#e6e2da]/60">
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  previewDevice === 'mobile'
                    ? 'bg-white text-[#1b3b2f] shadow-xs'
                    : 'text-[#556960] hover:text-[#162820]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Mobile
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  previewDevice === 'desktop'
                    ? 'bg-white text-[#1b3b2f] shadow-xs'
                    : 'text-[#556960] hover:text-[#162820]'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                Desktop
              </button>
            </div>
          </div>

          {/* Device Mockup Shell */}
          {previewDevice === 'mobile' ? (
            /* Mobile Lockscreen / Notification Card Preview */
            <div className="relative mx-auto max-w-[320px] rounded-[38px] p-4 bg-stone-950 text-white shadow-2xl border-4 border-stone-800">
              {/* Phone Speaker Notch */}
              <div className="w-24 h-4 bg-stone-900 rounded-full mx-auto mb-5" />

              {/* Status bar */}
              <div className="flex justify-between items-center px-2 text-[10px] text-[#85988e] mb-6 font-semibold">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <div className="w-4 h-2 rounded-xs border border-stone-400 p-0.5">
                    <div className="h-full w-full bg-stone-400" />
                  </div>
                </div>
              </div>

              {/* Lockscreen Clock */}
              <div className="text-center mb-6">
                <div className="text-4xl font-light tracking-tight text-stone-100">09:41</div>
                <div className="text-xs text-[#85988e] font-medium mt-0.5">Thursday, September 18</div>
              </div>

              {/* Push Notification Banner */}
              <div className="bg-stone-900/90 backdrop-blur-md rounded-2xl p-3.5 border border-stone-700/60 shadow-xl space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-white flex items-center justify-center p-0.5">
                      <img src="/images/serveos-icon.png" alt="ServeOS" className="w-4 h-auto object-contain" />
                    </div>
                    <span className="text-[11px] font-bold text-stone-200 truncate max-w-[130px]">
                      {restaurant.name || 'ServeOS Restaurant'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#85988e] font-medium">now</span>
                </div>

                {/* Content */}
                <div>
                  <h4 className="text-xs font-black text-white leading-tight">
                    {title || '🍕 20% OFF Pizza Today Only!'}
                  </h4>
                  <p className="text-[11px] text-stone-300 mt-1 leading-snug line-clamp-3">
                    {message ||
                      'Show this notification or tap to open the menu to redeem your exclusive 20% diner discount.'}
                  </p>
                </div>

                {/* Optional Banner Image */}
                {imageUrl && (
                  <div className="rounded-xl overflow-hidden max-h-28 bg-stone-800 border border-stone-700">
                    <img
                      src={imageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Interactive Action Buttons */}
                <div className="pt-1 flex gap-1.5">
                  <button
                    type="button"
                    className="flex-1 py-1 rounded-lg bg-[#efa736] text-stone-950 text-[10px] font-black tracking-wide text-center"
                  >
                    View Offer
                  </button>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-lg bg-stone-800 text-[#85988e] text-[10px] font-bold text-center"
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              {/* Home indicator bar */}
              <div className="w-28 h-1 bg-stone-600 rounded-full mx-auto mt-12 mb-1" />
            </div>
          ) : (
            /* Desktop Notification Banner Preview (macOS / Windows style) */
            <div className="p-4 bg-[#f4f1eb] rounded-2xl border border-[#e6e2da] space-y-4">
              <div className="flex items-center gap-1.5 text-[#85988e] text-xs font-semibold">
                <Laptop className="w-3.5 h-3.5" />
                <span>Desktop Push Notification (Chrome / Safari / Edge)</span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#e6e2da] shadow-lg space-y-3">
                {/* Desktop Notification Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#eef4f0] flex items-center justify-center p-0.5 border border-[#d2ded6]">
                      <img src="/images/serveos-icon.png" alt="ServeOS" className="w-4 h-auto object-contain" />
                    </div>
                    <div>
                      <div className="text-xs font-serif font-bold text-[#1b3b2f] leading-none">
                        {restaurant.name}
                      </div>
                      <div className="text-[10px] text-[#85988e] leading-none mt-0.5 font-mono">
                        via {typeof window !== 'undefined' ? window.location.hostname : 'serveos.app'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#85988e]">now</span>
                </div>

                {/* Title & Body */}
                <div>
                  <h4 className="text-xs font-black text-[#1b3b2f] leading-snug">
                    {title || '🍕 20% OFF Pizza Today Only!'}
                  </h4>
                  <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                    {message ||
                      'Show this notification or tap to open the menu to redeem your exclusive 20% diner discount.'}
                  </p>
                </div>

                {/* Banner preview */}
                {imageUrl && (
                  <div className="rounded-xl overflow-hidden max-h-32 bg-[#f4f1eb] border border-[#e6e2da]">
                    <img
                      src={imageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1 border-t border-[#f0ede6]">
                  <span className="text-[11px] font-bold text-[#556960] hover:text-[#162820] cursor-pointer">
                    Close
                  </span>
                  <span className="text-[11px] font-black text-[#1f4e47] hover:underline cursor-pointer">
                    Open Menu &rarr;
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Privacy & Safe Delivery Note */}
          <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e6e2da] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-stone-600">
              <span className="font-serif font-bold text-[#1b3b2f]">100% Privacy-Preserving</span>
              <p className="text-[11px] text-[#556960] mt-0.5">
                No customer emails or phone numbers needed. Push tokens are anonymized and end-to-end encrypted with your VAPID keys.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Audience Directory: Subscribed Devices & Opt-In Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e6e2da] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-serif font-bold text-[#1b3b2f]">
              Opted-In Customer Directory
            </h3>
            <p className="text-xs text-[#556960]">
              Active anonymous browser endpoints registered from your QR Menu
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Subscribers
            </Button>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto border border-[#e6e2da]/70 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf8f5]/80 text-[#556960] font-bold uppercase tracking-wider text-[10px] border-b border-[#e6e2da]">
              <tr>
                <th className="py-3 px-4">Device &amp; Browser</th>
                <th className="py-3 px-4">Subscribed Date</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4">Delivery Status</th>
                <th className="py-3 px-4 text-right">Channel Security</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-[#85988e]">
                    <Bell className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                    <p className="font-bold text-sm text-stone-600">No push subscribers yet</p>
                    <p className="text-xs text-[#85988e] mt-1">
                      Open your QR Menu at <code className="bg-[#f4f1eb] px-1.5 py-0.5 rounded text-stone-700 font-mono">/r/{restaurant.slug}</code> on your phone to trigger the opt-in modal!
                    </p>
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#faf8f5]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-[#f4f1eb] flex items-center justify-center text-stone-600 font-bold">
                          {(sub.device || '').toLowerCase().includes('mobile') || (sub.device || '').toLowerCase().includes('iphone') ? (
                            <Smartphone className="w-3.5 h-3.5" />
                          ) : (
                            <Laptop className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <div className="font-serif font-bold text-[#1b3b2f]">{sub.browser}</div>
                          <div className="text-[10px] text-[#85988e]">{sub.device}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-stone-600">
                      {new Date(sub.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#556960]">
                      {sub.last_seen
                        ? new Date(sub.last_seen).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Recently'}
                    </td>
                    <td className="py-3.5 px-4">
                      {sub.active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active End-Point
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f4f1eb] text-[#556960]">
                          Revoked / Expired
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-[10px] font-mono text-[#85988e] bg-[#f4f1eb] px-2 py-1 rounded-lg">
                        RFC 8291 • AES-128-GCM
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Campaign History Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e6e2da] shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-serif font-bold text-[#1b3b2f]">Broadcast History</h3>
            <p className="text-xs text-[#556960]">Record of dispatched push marketing campaigns</p>
          </div>
          <span className="text-xs font-bold text-[#85988e]">
            {campaigns.length} Campaign{campaigns.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="overflow-x-auto border border-[#e6e2da]/70 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf8f5]/80 text-[#556960] font-bold uppercase tracking-wider text-[10px] border-b border-[#e6e2da]">
              <tr>
                <th className="py-3 px-4">Campaign Title &amp; Message</th>
                <th className="py-3 px-4">Sent At</th>
                <th className="py-3 px-4">Target Audience</th>
                <th className="py-3 px-4">Delivered</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-[#85988e]">
                    No marketing campaigns sent yet.
                  </td>
                </tr>
              ) : (
                campaigns.map((cmp) => (
                  <tr key={cmp.id} className="hover:bg-[#faf8f5]/60 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-serif font-bold text-[#1b3b2f] truncate">{cmp.title}</div>
                      <div className="text-[11px] text-[#556960] truncate mt-0.5">{cmp.message}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-stone-600 whitespace-nowrap">
                      {new Date(cmp.sent_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#162820]">
                      {cmp.total_targeted} devices
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-emerald-700 font-bold">
                        {cmp.total_sent} delivered
                      </span>
                      {cmp.total_failed > 0 && (
                        <span className="text-[#85988e] text-[10px] ml-1.5">
                          ({cmp.total_failed} expired)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Completed
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Confirm Broadcast Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#e6e2da] space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-[#eef4f0] flex items-center justify-center text-[#3a7d5c]">
              <Send className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-[#1b3b2f]">
                Confirm Push Broadcast
              </h3>
              <p className="text-xs text-[#556960] mt-1">
                You are about to broadcast this message to{' '}
                <strong className="text-[#1b3b2f]">{stats.activeSubscribers} opted-in diners</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e6e2da] text-xs space-y-1.5">
              <div className="font-serif font-bold text-[#1b3b2f]">{title}</div>
              <p className="text-stone-600 text-[11px]">{message}</p>
              {ctaUrl && (
                <div className="text-[10px] font-mono text-[#85988e]">Link: {ctaUrl}</div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-xl border-[#e6e2da] text-stone-700 font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleExecuteSend}
                className="flex-1 rounded-xl bg-[#1f4e47] hover:bg-[#183e38] text-white font-bold"
              >
                Confirm &amp; Blast Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Send Result & Progress Breakdown */}
      {showResultModal && sendResult && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#e6e2da] space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-[#1b3b2f]">
                Broadcast Complete!
              </h3>
              <p className="text-xs text-[#556960] mt-0.5">
                Here is the delivery breakdown for your push campaign:
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 py-2">
              <div className="p-3 rounded-2xl bg-[#faf8f5] border border-[#e6e2da] text-center">
                <div className="text-lg font-black text-[#1b3b2f]">{sendResult.totalTargeted}</div>
                <div className="text-[10px] font-bold text-[#85988e] uppercase">Targeted</div>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                <div className="text-lg font-black text-emerald-700">{sendResult.totalSent}</div>
                <div className="text-[10px] font-bold text-emerald-600 uppercase">Delivered</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#faf8f5] border border-[#e6e2da] text-center">
                <div className="text-lg font-black text-[#556960]">{sendResult.totalFailed}</div>
                <div className="text-[10px] font-bold text-[#85988e] uppercase">Expired / Pruned</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#faf8f5] text-[11px] text-[#556960] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#85988e] shrink-0" />
              <span>Any revoked push subscriptions were automatically pruned from your database.</span>
            </div>

            <Button
              onClick={() => setShowResultModal(false)}
              className="w-full rounded-xl bg-[#efa736] hover:bg-[#df9928] text-stone-950 font-bold"
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {/* MODAL 3: Clear Subscribers Warning */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#e6e2da] space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-[#1b3b2f]">Clear All Subscribers?</h3>
              <p className="text-xs text-[#556960] mt-1">
                This will delete all {subscribers.length} registered push tokens for {restaurant.name}.
                Customers will have to re-opt in from your QR menu to receive future updates.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-xl border-[#e6e2da] text-stone-700 font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAllSubscribers}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                {isDeleting ? 'Clearing...' : 'Yes, Delete All'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
