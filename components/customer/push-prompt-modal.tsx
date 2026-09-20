'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Sparkles, X, CheckCircle2, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketingService } from '@/lib/marketing-service';

interface PushPromptModalProps {
  restaurantId: string;
  restaurantName: string;
  slug: string;
}

export function PushPromptModal({ restaurantId, restaurantName, slug }: PushPromptModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check browser Notification support
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    // Check if permission already permanently blocked
    if (Notification.permission === 'denied') {
      return;
    }

    // Check if customer already subscribed to this restaurant
    const alreadySubscribed = localStorage.getItem(`push_subscribed_${restaurantId}`);
    if (alreadySubscribed === 'true' || Notification.permission === 'granted') {
      return;
    }

    // Check if dismissed recently (within 7 days)
    const dismissedTimestamp = localStorage.getItem(`push_dismissed_${restaurantId}`);
    if (dismissedTimestamp) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTimestamp, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    let triggered = false;

    const triggerModal = () => {
      if (!triggered) {
        triggered = true;
        setIsOpen(true);
      }
    };

    // Trigger 1: Wait 30 seconds
    const timer = setTimeout(() => {
      triggerModal();
    }, 30000);

    // Trigger 2: When user scrolls past 55% of the menu height
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const scrolledRatio = window.scrollY / scrollHeight;
        if (scrolledRatio > 0.55) {
          triggerModal();
          window.removeEventListener('scroll', handleScroll);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [restaurantId]);

  const handleDismiss = () => {
    localStorage.setItem(`push_dismissed_${restaurantId}`, Date.now().toString());
    setIsOpen(false);
  };

  const handleEnableNotifications = async () => {
    setIsSubscribing(true);
    try {
      const result = await MarketingService.subscribeCustomer(restaurantId);
      if (result.success) {
        localStorage.setItem(`push_subscribed_${restaurantId}`, 'true');
        setIsSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
        }, 2200);
      } else {
        localStorage.setItem(`push_dismissed_${restaurantId}`, Date.now().toString());
        setIsOpen(false);
      }
    } catch (err) {
      localStorage.setItem(`push_dismissed_${restaurantId}`, Date.now().toString());
      setIsOpen(false);
    } finally {
      setIsSubscribing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200 antialiased">
      <div className="relative w-full max-w-sm bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-[32px] p-6 sm:p-7 shadow-board text-center space-y-4 overflow-hidden">
        {/* Subtle Decorative Ambient Glow */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#efa736]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-[#1f4e47]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          disabled={isSubscribing}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          /* Success Confirmation State */
          <div className="py-4 space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#1f4e47] border border-emerald-200/80 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-stone-900">
                You&#39;re All Set!
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed max-w-[260px] mx-auto">
                You will receive VIP discounts and culinary updates from <strong className="text-stone-800">{restaurantName}</strong>.
              </p>
            </div>
          </div>
        ) : (
          /* Default Prompt State */
          <>
            {/* Top Animated Icon Emblem */}
            <div className="w-14 h-14 rounded-2xl bg-[#1b3b2f] text-white flex items-center justify-center mx-auto shadow-sm relative">
              <Bell className="w-6 h-6 text-[#a3b899] animate-bounce" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#3a7d5c] border-2 border-white" />
            </div>

            {/* Header Content */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1b3b2f] px-2.5 py-0.5 rounded-full bg-[#eef4f0] border border-[#d2ded6] inline-flex items-center gap-1 font-sans">
                <Sparkles className="w-3 h-3 text-[#3a7d5c]" />
                <span>VIP Announcements</span>
              </span>
              <h3 className="text-xl font-serif font-bold tracking-tight text-[#1b3b2f]">
                Stay Updated
              </h3>
              <p className="text-xs text-[#556960] leading-relaxed max-w-[270px] mx-auto font-sans">
                Receive exclusive offers, discounts and new menu announcements from <strong className="text-[#162820]">{restaurantName}</strong>.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <Button
                onClick={handleEnableNotifications}
                disabled={isSubscribing}
                className="w-full bg-[#1b3b2f] hover:bg-[#153026] text-white font-semibold rounded-2xl h-11 shadow-sm gap-2 text-xs"
              >
                <Bell className="w-4 h-4" />
                <span>{isSubscribing ? 'Subscribing...' : 'Enable Notifications'}</span>
              </Button>

              <button
                onClick={handleDismiss}
                disabled={isSubscribing}
                className="w-full py-2.5 rounded-2xl border border-[#e6e2da] text-xs font-semibold text-[#556960] hover:text-[#162820] hover:bg-[#f4f1eb] transition-colors"
              >
                Maybe Later
              </button>

              <div className="pt-1 flex items-center justify-center gap-1.5 text-[10px] text-[#85988e]">
                <img src="/images/serveos-icon.png" alt="ServeOS" className="h-3 w-auto object-contain opacity-70" />
                <span>ServeOS Contactless Dining</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
