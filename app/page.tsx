'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  QrCode,
  Shield,
  LayoutDashboard,
  Play,
  ChefHat,
  Smartphone,
  Sparkles,
  Zap,
  TrendingUp,
  Receipt,
  Users,
  UtensilsCrossed,
  Calendar,
  CreditCard,
  MessageSquare,
  Clock,
  Star,
  ExternalLink,
  Laptop,
  Bell,
  SlidersHorizontal,
  Layers,
  Award,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { SubscriptionPlanEntity } from '@/lib/types';
import { SubscriptionPlanService } from '@/lib/subscription-plan-service';
import { INITIAL_SUBSCRIPTION_PLANS } from '@/lib/mock-data';
import { formatCurrency, CURRENCY_SYMBOL } from '@/lib/currency';
import { ServeOSLogo } from '@/components/ui/botanical-decorations';

export default function HomePage() {
  const [plans, setPlans] = useState<SubscriptionPlanEntity[]>(INITIAL_SUBSCRIPTION_PLANS);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeFloorZone, setActiveFloorZone] = useState<'all' | 'main' | 'terrace' | 'bar'>('all');

  useEffect(() => {
    SubscriptionPlanService.getPlans().then((data) => {
      const active = data.filter((p) => p.is_active);
      if (active.length > 0) setPlans(active);
    });

    const unsubscribe = SubscriptionPlanService.subscribe((updated) => {
      const active = updated.filter((p) => p.is_active);
      if (active.length > 0) setPlans(active);
    });

    return () => unsubscribe();
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const FAQS = [
    {
      q: 'How fast can our restaurant go live with ServeOS?',
      a: 'Most restaurants are fully operational in under 30 minutes. You can import your menu items, customize table numbers, and print QR codes immediately with no specialized hardware required.',
    },
    {
      q: 'Do guests need to download an application to order?',
      a: 'Never. Diners simply point their smartphone camera at the table QR stand. A sleek, instant web menu opens in under 1 second with dietary filters, item notes, and one-tap checkout.',
    },
    {
      q: 'What hardware is required for the Kitchen Display System (KDS)?',
      a: 'Any modern browser-enabled device. Most kitchens use an iPad, Android tablet, or existing touch monitor mounted on the cook line. You can also print thermal KOT tickets with one click.',
    },
    {
      q: 'How does the Web Push Marketing system work?',
      a: 'When guests enjoy their meal, they are invited to opt into promotional updates. You can broadcast happy hour alerts, weekend menus, or flash discounts directly to their phone lock screens without costly SMS charges.',
    },
    {
      q: 'Can we accept UPI, credit cards, and cash settlements?',
      a: 'Yes. ServeOS seamlessly reconciles digital payments (UPI, PhonePe, GPay, Cards) along with traditional POS terminals and cash settlements, complete with automated 5% dining GST calculation.',
    },
    {
      q: 'Is there a contract or cancellation fee?',
      a: 'None whatsoever. All plans are month-to-month or annual with no lock-in. You can upgrade, downgrade, or cancel directly from your billing settings at any time.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#122820] flex flex-col font-sans selection:bg-[#3A7D5C]/15 selection:text-[#122820] antialiased relative">
      {/* Soft natural sunlight & leaf shadow ambient background effect */}
      <div
        className="fixed inset-0 pointer-events-none select-none opacity-[0.035] mix-blend-multiply bg-repeat z-0"
        style={{
          backgroundImage: `radial-gradient(#122820 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
      

      {/* 1. Refined Minimalist Announcement Bar */}
      <div className="bg-[#122820] text-[#E8EDE9] text-xs py-2 px-4 font-medium tracking-wide z-30 border-b border-[#1D3A2F]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 mx-auto sm:mx-0">
            <span className="inline-block px-2 py-0.5 rounded-full bg-[#3A7D5C] text-white text-[10px] font-bold uppercase tracking-wider">
              NEW
            </span>
            <span className="text-[11px] sm:text-xs text-[#D8E3DC]">
              ServeOS 2.0 &bull; The tranquil operating system for luxury dining &amp; modern cafés
            </span>
          </div>
          <Link
            href="/r/the-rustic-table"
            className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#A5C9B4] hover:text-white font-medium transition-colors"
          >
            <span>Preview Live Guest Menu</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Top Navigation */}
      <Navbar />

      {/* 2. Hero Section */}
      <section className="relative pt-16 sm:pt-24 pb-20 md:pb-28 overflow-hidden z-10">
        {/* Large realistic indoor monstera plant framing the bottom-left edge */}
        

        {/* Real Monstera Plant subtly framing the top-right corner */}
        <div className="absolute -top-12 -right-12 w-[340px] sm:w-[460px] lg:w-[540px] aspect-square pointer-events-none select-none opacity-85 hidden md:block overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&auto=format&fit=crop&q=80"
            alt="Monstera plant in luxury restaurant interior"
            className="w-full h-full object-cover object-center transform rotate-12 scale-110 blur-[0.4px] [mask-image:radial-gradient(ellipse_at_top_right,black_45%,transparent_75%)]"
          />
        </div>
        

        {/* Soft leaf shadow falling gently across the hero header */}
        <div
          className="absolute top-0 right-1/4 w-96 h-96 pointer-events-none select-none opacity-[0.07] mix-blend-multiply hidden lg:block"
          style={{
            backgroundImage: `radial-gradient(circle at center, #122820 0%, transparent 70%)`,
            filter: 'blur(35px)',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Ceramic Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E6E2DA] text-xs font-semibold text-[#2D5A45] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#3A7D5C] animate-pulse" />
              <span>Modern Luxury Restaurant Software</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-serif font-bold text-[#122820] tracking-tight leading-[1.1]">
              Where hospitality meets <br className="hidden sm:inline" />
              <span className="italic font-normal text-[#24503C]">effortless precision.</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-[#55685E] max-w-2xl mx-auto leading-relaxed font-normal">
              ServeOS brings calm, thoughtful software to forward-thinking restaurants. Seamless QR dining, real-time kitchen orchestration, guest push marketing, and financial auditing — crafted for dining rooms that value every detail.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link href="/register">
                <Button className="rounded-full px-8 py-3.5 bg-[#122820] hover:bg-[#1B3B2F] text-[#F8FAF7] font-semibold shadow-sm h-12 text-xs sm:text-sm gap-2 transition-all">
                  <span>Start Free 14-Day Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link href="/r/the-rustic-table">
                <Button
                  variant="outline"
                  className="rounded-full px-7 py-3.5 bg-white border border-[#E6E2DA] hover:bg-[#FAF8F5] text-[#122820] font-semibold h-12 text-xs sm:text-sm shadow-xs transition-colors"
                >
                  <UtensilsCrossed className="w-4 h-4 text-[#3A7D5C]" />
                  <span>View Live Diner Menu</span>
                </Button>
              </Link>
            </div>

            {/* Micro-trust indicators */}
            <div className="pt-2 flex items-center justify-center gap-6 text-xs text-[#7A8C82] font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#3A7D5C]" /> No credit card required
              </span>
              <span className="hidden sm:inline">&bull;</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#3A7D5C]" /> 5-minute setup
              </span>
              <span className="hidden sm:inline">&bull;</span>
              <span className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" /> Rated 4.9/5 by 500+ restaurants
              </span>
            </div>
          </div>

          {/* 3. Hero Product Showcase: The Software in an Elegant Restaurant Space */}
          <div className="mt-14 sm:mt-18 max-w-5xl mx-auto relative">
            {/* White marble & oak wood shadow glow behind card */}
            <div className="absolute -inset-2 bg-gradient-to-b from-[#FAF7F0] via-[#F2ECE1]/60 to-[#E8E1D5]/40 rounded-[44px] -z-10 blur-xl opacity-70" />

            {/* Main Interactive Dashboard Preview Shell */}
            <div className="bg-white rounded-[36px] border border-[#E6E2DA] shadow-[0_24px_70px_rgba(18,40,32,0.08)] overflow-hidden">
              {/* Window Chrome */}
              <div className="bg-[#FAF8F5] border-b border-[#ECE8E0] px-6 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E0D8CD]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E0D8CD]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E0D8CD]" />
                  </div>
                  <span className="text-[#C8C2B6]">|</span>
                  <div className="flex items-center gap-2">
                    <ServeOSLogo size="sm" />
                    <span className="text-xs font-semibold text-[#122820]">The Rustic Table</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EEF4F0] text-[#122820] font-bold border border-[#D2DED6]">
                      ● LUNCH SERVICE ACTIVE
                    </span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-3 text-xs text-[#6B7D72]">
                  <span className="font-mono text-[11px]">serveos.internal/dashboard</span>
                  <span className="text-[11px] px-2.5 py-1 rounded-xl bg-white border border-[#E6E2DA] text-[#122820] font-semibold">
                    18/24 Tables Seated
                  </span>
                </div>
              </div>

              {/* Dashboard Content Mockup */}
              <div className="p-6 sm:p-8 space-y-6 bg-white">
                {/* 3 Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Card 1 */}
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E0]">
                    <span className="text-[11px] font-medium text-[#7A8C82] uppercase tracking-wider block">
                      Today&apos;s Gross Revenue
                    </span>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-2xl font-serif font-bold text-[#122820]">
                        ₹48,230
                      </span>
                      <span className="inline-flex items-center text-[11px] font-semibold text-[#2D6A4F] bg-[#EEF4F0] px-2 py-0.5 rounded-full">
                        <TrendingUp className="w-3 h-3 mr-1" /> +14.2%
                      </span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E0]">
                    <span className="text-[11px] font-medium text-[#7A8C82] uppercase tracking-wider block">
                      Active Kitchen Queue
                    </span>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-2xl font-serif font-bold text-[#122820]">
                        6 Tickets
                      </span>
                      <span className="text-[11px] font-medium text-[#7A8C82]">
                        12m avg prep speed
                      </span>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#ECE8E0]">
                    <span className="text-[11px] font-medium text-[#7A8C82] uppercase tracking-wider block">
                      Guest Satisfaction Score
                    </span>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-2xl font-serif font-bold text-[#122820]">
                        4.9 ★
                      </span>
                      <span className="text-[11px] font-medium text-[#2D6A4F]">
                        98% Positive Feedback
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2-Column Split: Interactive Floor Map + Live Ticket */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
                  {/* Left Column: Floor Map */}
                  <div className="lg:col-span-7 p-5 rounded-3xl bg-[#FAF8F5] border border-[#ECE8E0] space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#ECE8E0]">
                      <span className="text-xs font-serif font-bold text-[#122820]">
                        Dining Floor Pulse
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#7A8C82]">
                        <span className="w-2 h-2 rounded-full bg-[#3A7D5C]" />
                        <span>Realtime Seating</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { num: 'T-01', zone: 'Main Dining', status: 'Occupied', time: '42m', bill: '₹845' },
                        { num: 'T-02', zone: 'Main Dining', status: 'Available', time: 'Cleaned', bill: '-' },
                        { num: 'T-03', zone: 'Main Dining', status: 'Occupied', time: '18m', bill: '₹460' },
                        { num: 'P-01', zone: 'Terrace Garden', status: 'Occupied', time: '25m', bill: '₹680' },
                        { num: 'P-02', zone: 'Terrace Garden', status: 'Occupied', time: '34m', bill: '₹925' },
                        { num: 'VIP-1', zone: 'Private Lounge', status: 'Occupied', time: '55m', bill: '₹2,150' },
                      ].map((t) => (
                        <div
                          key={t.num}
                          className={`p-3 rounded-2xl border transition-all text-xs ${
                            t.status === 'Occupied'
                              ? 'bg-white border-[#D8E3DC] shadow-2xs'
                              : 'bg-white/60 border-[#ECE8E0] opacity-75'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-bold text-[#122820]">{t.num}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                t.status === 'Occupied'
                                  ? 'bg-[#EEF4F0] text-[#122820]'
                                  : 'bg-[#FAF8F5] text-[#7A8C82]'
                              }`}
                            >
                              {t.status}
                            </span>
                          </div>
                          <div className="mt-2 pt-1 border-t border-[#F0ECE4] flex items-center justify-between text-[11px] text-[#7A8C82]">
                            <span>{t.time}</span>
                            <span className="font-bold text-[#122820]">{t.bill}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Live Cook Line Ticket */}
                  <div className="lg:col-span-5 p-5 rounded-3xl bg-white border border-[#ECE8E0] shadow-2xs space-y-3.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE4]">
                        <div>
                          <span className="font-serif font-bold text-sm text-[#122820]">
                            Table 04 &bull; Terrace Garden
                          </span>
                          <span className="text-[10px] text-[#7A8C82] block">Order #925 &bull; 8m ago</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EEF4F0] text-[#122820] border border-[#D2DED6]">
                          COOKING
                        </span>
                      </div>

                      <div className="space-y-2 py-2 text-xs">
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-[#122820]">1x Wood-Fired Truffle Margherita</span>
                          <span className="text-[#7A8C82]">₹425</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-[#122820]">1x Burrata &amp; Charred Peaches</span>
                            <span className="text-[10px] text-[#B8782A] block italic">&quot;Extra balsamic glaze&quot;</span>
                          </div>
                          <span className="text-[#7A8C82]">₹290</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-[#122820]">2x Rosemary Elderflower Spritz</span>
                          <span className="text-[#7A8C82]">₹240</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#F0ECE4] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#7A8C82] block">Total (incl. GST 5%)</span>
                        <span className="font-serif font-bold text-sm text-[#122820]">₹955.00</span>
                      </div>
                      <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#122820] text-white">
                        Mark Ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Small realistic indoor potted plant resting on the desk ledge beside the card */}
            
            {/* Minimal desk plant on the left corner */}
            <div className="absolute -top-6 -left-6 hidden lg:flex pointer-events-none select-none z-20">
              
            </div>
          </div>
        </div>
      </section>

      {/* 4. Social Proof & Restaurant Brand Logos */}
      <section className="py-12 border-y border-[#ECE8E0] bg-white/70 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs uppercase tracking-widest font-semibold text-[#7A8C82] mb-8">
            Powering service at distinguished restaurants, rooftop lounges, and artisan cafés
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-center opacity-80">
            <div className="text-center font-serif text-lg font-bold tracking-tight text-[#122820]">
              OSTERIA BOTANICA
            </div>
            <div className="text-center font-serif text-lg font-bold tracking-tight text-[#122820]">
              THE RUSTIC TABLE
            </div>
            <div className="text-center font-serif text-lg font-bold tracking-tight text-[#122820]">
              L&apos;AVENUE BISTRO
            </div>
            <div className="text-center font-serif text-lg font-bold tracking-tight text-[#122820]">
              VERDANT LOUNGE
            </div>
            <div className="text-center font-serif text-lg font-bold tracking-tight text-[#122820]">
              STELLA WOODFIRE
            </div>
          </div>
        </div>
      </section>

      {/* 5. The Core Pillars (Clean SaaS Bento Grid with Lots of Whitespace) */}
      <section id="features" className="py-24 sm:py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-2">
              
              <span className="text-xs font-semibold text-[#2D5A45] tracking-widest uppercase">
                Architecture &bull; Built For Daily Rhythm
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#122820]">
              Everything you need to orchestrate a seamless dining room.
            </h2>
            <p className="text-sm sm:text-base text-[#55685E]">
              Replace multiple disconnected apps and hardware leases with one cohesive, beautifully designed system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Card 1: Artisan QR Dining */}
            <div className="p-8 rounded-[32px] bg-white border border-[#E6E2DA] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF4F0] text-[#122820] flex items-center justify-center border border-[#D2DED6]">
                  <QrCode className="w-6 h-6 text-[#2D5A45]" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#122820]">
                  Artisan QR Table Dining
                </h3>
                <p className="text-xs sm:text-[13px] text-[#55685E] leading-relaxed">
                  Guests browse a responsive, tactile digital menu directly on their smartphones without downloading an app. Supports dietary filters (Vegan, Veg, GF), chef pairings, and instant table dispatch.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#F0ECE4] flex items-center justify-between text-xs text-[#2D5A45] font-semibold">
                <span>0s App Download</span>
                <span>&rarr;</span>
              </div>
            </div>

            {/* Feature Card 2: Kitchen Display System (KDS) */}
            <div className="p-8 rounded-[32px] bg-white border border-[#E6E2DA] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF4F0] text-[#122820] flex items-center justify-center border border-[#D2DED6]">
                  <ChefHat className="w-6 h-6 text-[#2D5A45]" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#122820]">
                  Kitchen Display System (KDS)
                </h3>
                <p className="text-xs sm:text-[13px] text-[#55685E] leading-relaxed">
                  Clear digital tickets for line cooks and expo chefs. Real-time cooking timers, acoustic chime alerts, and status progression ensure no orders are forgotten during peak service rush.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#F0ECE4] flex items-center justify-between text-xs text-[#2D5A45] font-semibold">
                <span>Printable KOT Support</span>
                <span>&rarr;</span>
              </div>
            </div>

            {/* Feature Card 3: Instant Browser Push Marketing */}
            <div className="p-8 rounded-[32px] bg-white border border-[#E6E2DA] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF4F0] text-[#122820] flex items-center justify-center border border-[#D2DED6]">
                  <Bell className="w-6 h-6 text-[#2D5A45]" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#122820]">
                  Customer Web Push Marketing
                </h3>
                <p className="text-xs sm:text-[13px] text-[#55685E] leading-relaxed">
                  Turn one-time diners into loyal regulars. Re-engage past guests directly on their phone lock-screens with weekend menu announcements and flash specials — with ₹0 SMS fees.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#F0ECE4] flex items-center justify-between text-xs text-[#2D5A45] font-semibold">
                <span>RFC 8291 Web Push</span>
                <span>&rarr;</span>
              </div>
            </div>

            {/* Feature Card 4: Multi-Zone Floor Telemetry */}
            <div className="p-8 rounded-[32px] bg-white border border-[#E6E2DA] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF4F0] text-[#122820] flex items-center justify-center border border-[#D2DED6]">
                  <Layers className="w-6 h-6 text-[#2D5A45]" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#122820]">
                  Multi-Zone Floor Mapping
                </h3>
                <p className="text-xs sm:text-[13px] text-[#55685E] leading-relaxed">
                  Organize tables by dining zones: Main Dining Room, Terrace Garden, Botanical Cocktail Bar, and VIP Rooms. Monitor live occupancy, server assignments, and turn rates at a glance.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#F0ECE4] flex items-center justify-between text-xs text-[#2D5A45] font-semibold">
                <span>Custom Table Stands</span>
                <span>&rarr;</span>
              </div>
            </div>

            {/* Feature Card 5: Financial Register & 5% GST */}
            <div className="p-8 rounded-[32px] bg-white border border-[#E6E2DA] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF4F0] text-[#122820] flex items-center justify-center border border-[#D2DED6]">
                  <Receipt className="w-6 h-6 text-[#2D5A45]" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#122820]">
                  Accounting &amp; GST Ledger
                </h3>
                <p className="text-xs sm:text-[13px] text-[#55685E] leading-relaxed">
                  Keep daily finances strictly audited in Indian Rupees. Automatic 5% restaurant GST breakdown, UPI / card ratio auditing, server tip logs, and 1-click tax report CSV exports.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#F0ECE4] flex items-center justify-between text-xs text-[#2D5A45] font-semibold">
                <span>1-Click CSV Audits</span>
                <span>&rarr;</span>
              </div>
            </div>

            {/* Feature Card 6: Staff & Shift Operations */}
            <div className="p-8 rounded-[32px] bg-white border border-[#E6E2DA] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF4F0] text-[#122820] flex items-center justify-center border border-[#D2DED6]">
                  <Users className="w-6 h-6 text-[#2D5A45]" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#122820]">
                  Staff Roster &amp; Shifts
                </h3>
                <p className="text-xs sm:text-[13px] text-[#55685E] leading-relaxed">
                  Coordinate your front-of-house servers, sommeliers, and kitchen leads. Assign team members to specific floor sections, track on-shift statuses, and maintain smooth service transitions.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#F0ECE4] flex items-center justify-between text-xs text-[#2D5A45] font-semibold">
                <span>Role-Based Access</span>
                <span>&rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Editorial Story: The Elegant Café Owner Experience */}
      <section className="py-20 sm:py-28 bg-[#F4F7F5] border-y border-[#ECE8E0] relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Real photography of modern café interior with natural sunlight & greenery */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-[36px] overflow-hidden border border-[#D8E3DC] shadow-lg relative aspect-[4/3] bg-white">
                <img
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1000&auto=format&fit=crop&q=80"
                  alt="Modern luxury restaurant with calm botanical interior and oak tables"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between text-white text-xs">
                  <div>
                    <span className="font-serif font-bold text-sm block">The Rustic Table</span>
                    <span className="text-stone-200 text-[11px]">Downtown Civil Lines &bull; 24 Tables</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white/90 text-[#122820] font-bold text-[11px] backdrop-blur-xs">
                    ServeOS Customer
                  </span>
                </div>
              </div>
            </div>

            {/* Editorial Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#D8E3DC] text-xs font-semibold text-[#2D5A45]">
                <Award className="w-3.5 h-3.5 text-[#3A7D5C]" />
                <span>Restaurateur Perspective</span>
              </div>

              <blockquote className="font-serif text-2xl sm:text-3xl text-[#122820] leading-snug">
                &ldquo;Before ServeOS, our dining room felt cluttered with order pads and loud thermal printers. Now, our floor is calm, our servers are genuinely present with guests, and our table turn rate improved by 18% in the first month.&rdquo;
              </blockquote>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <p className="font-serif font-bold text-base text-[#122820]">Chef Gladina Sterling</p>
                  <p className="text-xs text-[#55685E]">Executive Chef &amp; Proprietor &bull; The Rustic Table</p>
                </div>
                
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#D8E3DC]">
                <div>
                  <span className="text-2xl font-serif font-bold text-[#122820] block">+18%</span>
                  <span className="text-[11px] text-[#55685E]">Higher table spend</span>
                </div>
                <div>
                  <span className="text-2xl font-serif font-bold text-[#122820] block">-9 min</span>
                  <span className="text-[11px] text-[#55685E]">Faster dish prep</span>
                </div>
                <div>
                  <span className="text-2xl font-serif font-bold text-[#122820] block">4.9 ★</span>
                  <span className="text-[11px] text-[#55685E]">Diner review average</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Transparent Pricing (Indian Rupees) */}
      <section id="pricing" className="py-24 sm:py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-semibold text-[#2D5A45] tracking-widest uppercase">
              Transparent Pricing &bull; Scale At Your Own Pace
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#122820]">
              Fair, predictable pricing for every dining footprint.
            </h2>
            <p className="text-sm sm:text-base text-[#55685E]">
              No hidden gateway charges, no per-order commissions, and no long-term contracts.
            </p>

            {/* Monthly / Yearly Toggle */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <span className={`text-xs font-semibold ${billingInterval === 'monthly' ? 'text-[#122820]' : 'text-[#7A8C82]'}`}>
                Monthly Billing
              </span>
              <button
                type="button"
                onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
                className="w-12 h-6 rounded-full bg-[#E0D8CD] p-0.5 transition-colors relative"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[#122820] transition-transform ${
                    billingInterval === 'yearly' ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${billingInterval === 'yearly' ? 'text-[#122820]' : 'text-[#7A8C82]'}`}>
                Annual Billing
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EEF4F0] text-[#2D5A45] border border-[#D2DED6]">
                  Save 20%
                </span>
              </span>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Tier 1: Starter */}
            <div className="rounded-[36px] bg-white border border-[#E6E2DA] p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#7A8C82]">Café Starter</div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-serif font-bold text-[#122820]">
                    {billingInterval === 'yearly' ? '₹159' : '₹199'}
                  </span>
                  <span className="text-xs text-[#7A8C82]">/ month</span>
                </div>
                <p className="text-xs text-[#55685E] mt-3 leading-relaxed">
                  Ideal for small bistros, coffee shops, and quick counter dining up to 8 tables.
                </p>

                <div className="mt-6 pt-6 border-t border-[#F0ECE4] space-y-3 text-xs text-[#122820]">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#3A7D5C]" /> Up to 8 QR Dine-in Tables
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#3A7D5C]" /> Instant Mobile Digital Menu
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#3A7D5C]" /> Realtime Kitchen Ticket Feed
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#3A7D5C]" /> Daily Sales Summary in INR
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#F0ECE4]">
                <Link href="/register">
                  <Button variant="outline" className="w-full rounded-2xl text-xs py-3 border-[#E6E2DA] text-[#122820]">
                    Choose Starter
                  </Button>
                </Link>
              </div>
            </div>

            {/* Tier 2: Garden Pro (Highlighted) */}
            <div className="rounded-[36px] bg-[#122820] text-[#F8FAF7] p-8 shadow-xl flex flex-col justify-between relative ring-2 ring-[#3A7D5C]">
              <span className="absolute -top-3.5 right-6 bg-[#3A7D5C] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                MOST POPULAR
              </span>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#A5C9B4]">Garden Pro</div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-serif font-bold text-white">
                    {billingInterval === 'yearly' ? '₹399' : '₹499'}
                  </span>
                  <span className="text-xs text-[#A5C9B4]">/ month</span>
                </div>
                <p className="text-xs text-[#D2DED6] mt-3 leading-relaxed">
                  Full restaurant operating system with live KDS, push marketing, and multi-zone table mapping.
                </p>

                <div className="mt-6 pt-6 border-t border-[#254538] space-y-3 text-xs text-[#E8F1EC]">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#7AC299]" /> Unlimited QR Tables &amp; Zones
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#7AC299]" /> Live Kitchen Display System (KDS)
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#7AC299]" /> Web Push Marketing (10,000 / mo)
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#7AC299]" /> Thermal KOT Receipt Printing
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#7AC299]" /> Multi-Staff Shifts &amp; Roles
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#254538]">
                <Link href="/register">
                  <Button className="w-full bg-[#3A7D5C] hover:bg-[#2D6A4F] text-white rounded-2xl text-xs py-3 font-semibold shadow-xs">
                    Start 14-Day Free Trial
                  </Button>
                </Link>
              </div>
            </div>

            {/* Tier 3: Enterprise */}
            <div className="rounded-[36px] bg-white border border-[#E6E2DA] p-8 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#7A8C82]">Reserve Estate</div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-serif font-bold text-[#122820]">
                    {billingInterval === 'yearly' ? '₹799' : '₹999'}
                  </span>
                  <span className="text-xs text-[#7A8C82]">/ month</span>
                </div>
                <p className="text-xs text-[#55685E] mt-3 leading-relaxed">
                  Multi-outlet dining groups, boutique hotels, and high-volume dining establishments.
                </p>

                <div className="mt-6 pt-6 border-t border-[#F0ECE4] space-y-3 text-xs text-[#122820]">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#3A7D5C]" /> Everything in Garden Pro
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#3A7D5C]" /> Centralized Multi-Branch Control
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#3A7D5C]" /> Unlimited Web Push Campaigns
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#3A7D5C]" /> Dedicated Concierge Onboarding
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#3A7D5C]" /> 99.9% Uptime SLA
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#F0ECE4]">
                <Link href="/register">
                  <Button variant="outline" className="w-full rounded-2xl text-xs py-3 border-[#E6E2DA] text-[#122820]">
                    Contact Concierge
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Frequently Asked Questions */}
      <section id="faq" className="py-20 border-t border-[#ECE8E0] bg-[#FAF8F5] relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <span className="text-xs font-semibold text-[#2D5A45] tracking-widest uppercase">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl font-serif font-bold text-[#122820]">
              Everything you need to know about ServeOS.
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#E6E2DA] bg-white overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4"
                  >
                    <span className="font-serif font-bold text-base text-[#122820]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#7A8C82] transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#122820]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-[#55685E] leading-relaxed border-t border-[#F0ECE4] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. Final Call To Action Banner */}
      <section className="py-20 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#122820] text-white rounded-[40px] p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl border border-[#234336]">
            {/* Soft background ambient light */}
            <div
              className="absolute -top-24 -right-24 w-96 h-96 pointer-events-none opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle, #529C73 0%, transparent 70%)',
              }}
            />

            <div className="relative z-10 max-w-2xl mx-auto space-y-5">
              <span className="inline-block px-3 py-1 rounded-full bg-[#1D3A2F] text-[#A5C9B4] text-xs font-semibold border border-[#2E5545]">
                Ready for Service
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight">
                Transform your restaurant’s daily rhythm today.
              </h2>
              <p className="text-xs sm:text-sm text-[#D2DED6] leading-relaxed">
                Join hundreds of forward-thinking restaurants delivering unforgettable dining experiences with ServeOS. Setup takes 5 minutes.
              </p>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/register">
                  <Button className="rounded-full px-8 py-3.5 bg-white hover:bg-[#FAF8F5] text-[#122820] font-bold text-xs sm:text-sm shadow-sm">
                    Start 14-Day Free Trial
                  </Button>
                </Link>
                <Link href="/r/the-rustic-table">
                  <Button
                    variant="outline"
                    className="rounded-full px-7 py-3.5 border-[#2E5545] text-[#E8F1EC] hover:bg-[#1D3A2F] text-xs sm:text-sm"
                  >
                    Experience Diner QR Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Minimalist Clean Footer */}
      <footer className="border-t border-[#ECE8E0] bg-[#FAF8F5] py-12 text-xs text-[#7A8C82] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <ServeOSLogo size="sm" />
            <span>&copy; {new Date().getFullYear()} ServeOS &bull; The Modern Restaurant Operating System.</span>
          </div>

          <div className="flex items-center gap-6 text-[#55685E] font-medium">
            <Link href="/#features" className="hover:text-[#122820] transition-colors">
              Product
            </Link>
            <Link href="/#pricing" className="hover:text-[#122820] transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-[#122820] transition-colors">
              Portal Sign In
            </Link>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-[#2D6A4F] bg-[#EEF4F0] px-2.5 py-0.5 rounded-full border border-[#D2DED6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3A7D5C]" />
              All Systems Live
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
