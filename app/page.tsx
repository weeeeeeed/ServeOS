'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  QrCode,
  Shield,
  LayoutDashboard,
  Compass,
  Play,
  ChefHat,
  Tablet,
  Layers,
  Smartphone,
} from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [emailInput, setEmailInput] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  return (
    <div className="min-h-screen bg-[#eae9e4] text-[#1c1917] flex flex-col selection:bg-[#efa736] selection:text-stone-950 font-sans antialiased">
      {/* 1. Top Announcement Bar */}
      <div className="bg-[#1f4e47] text-emerald-100 text-[11px] sm:text-xs py-2 px-4 font-medium tracking-wide">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-4">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="inline-block px-2 py-0.5 rounded bg-[#efa736] text-[10px] font-black tracking-wider uppercase text-stone-950">
              BITEPOINT 2.0
            </span>
            <span className="opacity-95">
              Modern Culinary OS for Fine-Dine Courtyards, Bustling Bistros &amp; High-Velocity Kitchens
            </span>
          </div>
          <Link
            href="/r/la-piazza"
            className="inline-flex items-center gap-1 text-[#efa736] hover:text-white transition-colors underline-offset-2 hover:underline font-bold"
          >
            <span>Try Live Diner QR Demo</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 2. Navigation Header */}
      <Navbar />

      {/* 3. Hero Section with Floating Board Shell */}
      <section className="relative px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="max-w-[1440px] mx-auto bg-white rounded-[32px] sm:rounded-[40px] border border-stone-200/90 shadow-board p-6 sm:p-12 md:p-16 text-center relative overflow-hidden">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-stone-200 bg-[#faf9f6] text-[10px] sm:text-[11px] font-black tracking-[0.18em] uppercase text-[#1f4e47] mb-8 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#efa736] animate-pulse" />
            <span>LIVE FLOOR RADAR</span>
            <span className="opacity-30">•</span>
            <span>KITCHEN PASS SYNC</span>
            <span className="opacity-30">•</span>
            <span>CONTACTLESS QR DINING</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sans font-black tracking-tight text-stone-900 max-w-4xl mx-auto leading-[1.08]">
            Run your floor, kitchen, and guests with{' '}
            <span className="text-[#1f4e47] underline decoration-[#efa736] decoration-wavy decoration-2">effortless grace.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed font-sans">
            A unified hospitality operating system bridging timeless dining craft with instant cloud speed.
            Point-of-sale, contactless QR, intelligent floor radar, and kitchen sync in seamless harmony.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-[#efa736] hover:bg-[#e09827] text-stone-950 font-bold rounded-xl px-7 py-3 text-sm shadow-card gap-2 transition-all hover:translate-y-[-1px]"
              >
                <span>Start Your 14-Day Free Access</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-[#1f4e47] hover:bg-[#133e36] text-white font-bold rounded-xl px-6 py-3 text-sm shadow-xs gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-[#efa736] text-[#efa736]" />
                <span>Open Owner Dashboard</span>
              </Button>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#78716c] font-medium">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#109955]" />
              <span>Free hardware swap setup</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#109955]" />
              <span>$150M+ Offline-Resilient Transactions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#109955]" />
              <span>24/7 Sommelier &amp; Chef Support</span>
            </div>
          </div>

          {/* Hero Tablet Device Mockup */}
          <div className="mt-14 max-w-[1180px] mx-auto relative group">
            {/* Ambient shadow glow */}
            <div className="absolute -inset-1.5 bg-gradient-to-b from-[#873724]/10 via-[#efa736]/10 to-transparent rounded-[38px] blur-xl opacity-70 group-hover:opacity-100 transition-opacity" />

            {/* Hardware Tablet Bezel */}
            <div className="relative rounded-[32px] sm:rounded-[38px] bg-[#1a1816] p-3 sm:p-5 shadow-2xl border border-stone-800">
              {/* Camera punch hole / mic */}
              <div className="absolute top-2 sm:top-2.5 left-1/2 -translate-x-1/2 w-3 h-1.5 rounded-full bg-stone-900 border border-stone-700/60" />

              {/* Tablet Screen Container */}
              <div className="rounded-[22px] sm:rounded-[28px] overflow-hidden bg-[#faf9f6] border border-stone-200">
                {/* Tablet Top Window Bar */}
                <div className="bg-[#f0ede8] px-4 py-2.5 flex items-center justify-between border-b border-[#e4dfd7] text-xs text-[#78716c]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#e15241]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#efa736]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#109955]" />
                    <span className="ml-3 font-semibold text-[#1c1917] text-[11px] tracking-wide">
                      Live Floor Occupancy &amp; Active Pass
                    </span>
                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-[#e4f8ed] text-[#109955] text-[10px] font-bold">
                      ● Sync Active (Peer Mesh)
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="hidden md:inline">Average Turn Pace: <strong className="text-[#1c1917]">14.2 min</strong></span>
                    <span className="hidden sm:inline">Active Guests: <strong className="text-[#1c1917]">84 / 120</strong></span>
                    <Link
                      href="/dashboard"
                      className="px-2.5 py-1 rounded-lg bg-[#873724] text-white hover:bg-[#732f1e] font-semibold text-[10px] transition-colors"
                    >
                      Open Live Board
                    </Link>
                  </div>
                </div>

                {/* Tablet Inner Dashboard Visual */}
                <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 text-left">
                  {/* Left 8 Cols: Floor Grid */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* Zones header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#873724]">
                          Zone: Courtyard &amp; Main Salon
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="px-2.5 py-1 rounded-full bg-[#1c1917] text-white text-[11px] font-semibold">
                          All (12)
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-[#e9e6e0] text-[#78716c] text-[11px] font-medium">
                          Terrace
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-[#e9e6e0] text-[#78716c] text-[11px] font-medium">
                          Patio
                        </span>
                      </div>
                    </div>

                    {/* Table Matrix Mini Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {/* Table 04 - Active Dining */}
                      <div className="p-3 rounded-2xl bg-white border-2 border-[#873724] shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#1c1917]">T-04</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#fff6e5] text-[#d97706] text-[10px] font-bold">
                            Main Course
                          </span>
                        </div>
                        <p className="text-[11px] text-[#78716c] line-clamp-1">4 Guests • Tasting Menu</p>
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-[#78716c]">
                          <span>Turn: 41m / 65m</span>
                          <span className="font-bold text-[#1c1917]">$312.50</span>
                        </div>
                      </div>

                      {/* Table 02 - Appetizer */}
                      <div className="p-3 rounded-2xl bg-white border border-[#eceae6] shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#1c1917]">T-02</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#eef4ff] text-[#3b82f6] text-[10px] font-bold">
                            Appetizers
                          </span>
                        </div>
                        <p className="text-[11px] text-[#78716c] line-clamp-1">2 Guests • Wine Pairing</p>
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-[#78716c]">
                          <span>Turn: 16m / 50m</span>
                          <span className="font-bold text-[#1c1917]">$148.00</span>
                        </div>
                      </div>

                      {/* Table 09 - Ready / Dessert */}
                      <div className="p-3 rounded-2xl bg-white border border-[#eceae6] shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#1c1917]">T-09</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#e4f8ed] text-[#109955] text-[10px] font-bold">
                            Dessert
                          </span>
                        </div>
                        <p className="text-[11px] text-[#78716c] line-clamp-1">6 Guests • Cellar reserve</p>
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-[#78716c]">
                          <span>Turn: 58m / 75m</span>
                          <span className="font-bold text-[#1c1917]">$485.00</span>
                        </div>
                      </div>

                      {/* Table VIP Pavilion */}
                      <div className="p-3 rounded-2xl bg-[#fdfaf5] border border-amber-300 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#873724]">VIP Pavilion</span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Course 4 of 7
                          </span>
                        </div>
                        <p className="text-[11px] text-[#78716c] line-clamp-1">8 Guests • Royal Haveli Suite</p>
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-[#78716c]">
                          <span>Sommelier staged</span>
                          <span className="font-bold text-[#1c1917]">$890.00</span>
                        </div>
                      </div>

                      {/* Table 05 - Seated */}
                      <div className="p-3 rounded-2xl bg-white border border-[#eceae6] shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#1c1917]">T-05</span>
                          <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold">
                            Ordering
                          </span>
                        </div>
                        <p className="text-[11px] text-[#78716c] line-clamp-1">3 Guests • Table QR Active</p>
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-[#78716c]">
                          <span>Browsing QR</span>
                          <span className="font-bold text-[#1c1917]">$72.50</span>
                        </div>
                      </div>

                      {/* Table 01 - Clean & Reset */}
                      <div className="p-3 rounded-2xl bg-white border border-[#eceae6] shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#1c1917]">T-01</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                            Available
                          </span>
                        </div>
                        <p className="text-[11px] text-[#78716c] line-clamp-1">Sanitized &amp; QR Primed</p>
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-[#78716c]">
                          <span>Seats 4</span>
                          <span className="text-[#109955] font-semibold">Ready</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right 4 Cols: Live Ticket Inspector Drawer */}
                  <div className="lg:col-span-4 bg-white rounded-2xl border border-[#eceae6] p-4 space-y-3.5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#873724]" />
                          <span className="font-bold text-xs uppercase tracking-wider text-[#1c1917]">
                            Floor Inspector: T-04
                          </span>
                        </div>
                        <span className="text-[10px] text-[#78716c]">Server: Julian R.</span>
                      </div>

                      <div className="mt-3 space-y-2 text-xs">
                        <div className="p-2 rounded-xl bg-[#faefe9] border border-[#e8dcd5] text-[#873724] text-[11px]">
                          <strong>VIP Note:</strong> Celebrating 25th Anniversary. Complementary Prosecco served.
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[#1c1917] font-medium">
                            <span>1x Smoked Duck Breast Rossini</span>
                            <span className="text-[#109955] font-semibold">Ready</span>
                          </div>
                          <div className="flex items-center justify-between text-[#1c1917] font-medium">
                            <span>1x Handcrafted Truffle Agnolotti</span>
                            <span className="text-[#d97706] font-semibold">Plating</span>
                          </div>
                          <div className="flex items-center justify-between text-[#1c1917] font-medium">
                            <span>2x Barolo Riserva DOCG 2018</span>
                            <span className="text-[#109955] font-semibold">Poured</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#78716c] block">Current Bill Total</span>
                        <span className="text-base font-bold text-[#1c1917]">$312.50</span>
                      </div>
                      <Link href="/dashboard">
                        <Button size="sm" className="bg-[#873724] text-white hover:bg-[#732f1e] text-xs font-semibold rounded-lg">
                          Manage Ticket
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Social Proof / Metrics Bar */}
      <section id="performance" className="py-16 border-y border-[#eceae6] bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] font-bold tracking-widest uppercase text-[#873724]">
            HONORED BY OUR GUESTS &amp; CO-DIRECTORS
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-serif text-[#1c1917] max-w-2xl mx-auto">
            Trusted by over 1,400+ celebrated heritage restaurants, courtyards, and artisanal dining groups worldwide.
          </h2>

          {/* 4 Stat Callouts */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#eceae6]">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#873724]">
                99.98%
              </div>
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#1c1917]">
                Off-Network Guarantee
              </p>
              <p className="mt-1 text-xs text-[#78716c]">
                Never drop tickets, even if local internet drops.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#eceae6]">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#873724]">
                14.2 min
              </div>
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#1c1917]">
                Average Table Turn
              </p>
              <p className="mt-1 text-xs text-[#78716c]">
                6.1m faster service checkout through intelligent QR.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#eceae6]">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#873724]">
                + 28.4%
              </div>
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#1c1917]">
                Reorder &amp; Pairing Boost
              </p>
              <p className="mt-1 text-xs text-[#78716c]">
                when diners browse sensory pairing notes.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#eceae6]">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#873724]">
                3.4x
              </div>
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#1c1917]">
                Server Checkout Tilt
              </p>
              <p className="mt-1 text-xs text-[#78716c]">
                Staff spend 70% more time on table craft.
              </p>
            </div>
          </div>

          {/* Restaurant Names Logos */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 md:gap-14 text-sm md:text-base font-serif tracking-widest uppercase text-[#78716c] opacity-85">
            <span className="hover:text-[#1c1917] transition-colors">THE PALACE HAVELI</span>
            <span className="hover:text-[#1c1917] transition-colors">DARBAR SUITE 9</span>
            <span className="hover:text-[#1c1917] transition-colors">TERRACOTTA KITCHEN</span>
            <span className="hover:text-[#1c1917] transition-colors">Authors &amp; Vine</span>
            <span className="hover:text-[#1c1917] transition-colors">ARCH &amp; GROTTO</span>
          </div>
        </div>
      </section>

      {/* 5. Feature Bento Cards Grid ("ENGINEERED FOR SUPREME HOSPITALITY STANDARDS") */}
      <section id="floor-radar" className="py-20 md:py-28">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-[11px] font-bold tracking-widest uppercase text-[#873724]">
              ENGINEERED FOR SUPREME HOSPITALITY STANDARDS
            </p>
            <h2 className="mt-3 text-3xl sm:text-5xl font-serif text-[#1c1917]">
              Everything your floor, culinary crew, and guests need.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#615b56]">
              Designed specifically to eliminate friction in high-ambience, high-volume culinary establishments.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Card 1: Architectural Multi-Zone Floor Radar (Col 7) */}
            <div id="operations" className="lg:col-span-7 rounded-[28px] bg-white border border-[#eceae6] p-8 shadow-xs hover:shadow-card transition-shadow relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-full bg-[#faefe9] text-[#873724] text-[11px] font-bold uppercase tracking-wider">
                  Floor Intelligence
                </span>
                <h3 className="mt-4 text-2xl sm:text-3xl font-serif text-[#1c1917]">
                  Architectural Multi-Zone Floor Radar
                </h3>
                <p className="mt-3 text-sm text-[#615b56] leading-relaxed">
                  Model complex heritage dining layouts with precision — courtyards, arched alcoves, private dining salons, and terrace pavilions. View real-time seat allegiance, course progress, and turnover clean-up alerts.
                </p>

                <ul className="mt-6 space-y-2.5 text-xs text-[#1c1917] font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#873724]" />
                    <span>Dynamic section saturation &amp; time-under-order alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#873724]" />
                    <span>Course-aware color coding: appetizer, entrée, dessert, settling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#873724]" />
                    <span>Instant VIP and dietary restriction alerts on seat hovering</span>
                  </li>
                </ul>
              </div>

              {/* Decorative Geometric Arch Element */}
              <div className="mt-8 pt-6 border-t border-stone-100 flex items-center justify-between text-xs text-[#78716c]">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#873724]" />
                  <span>Interactive Salon Vector Layout Engine</span>
                </div>
                <Link href="/dashboard" className="text-[#873724] font-semibold hover:underline flex items-center gap-1">
                  <span>View in Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: Direct QR Studio & Heritage Storytelling (Col 5) */}
            <div className="lg:col-span-5 rounded-[28px] bg-white border border-[#eceae6] p-8 shadow-xs hover:shadow-card transition-shadow flex flex-col justify-between">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-full bg-[#eef4ff] text-[#3b82f6] text-[11px] font-bold uppercase tracking-wider">
                  Diner Touchpoint
                </span>
                <h3 className="mt-4 text-2xl sm:text-3xl font-serif text-[#1c1917]">
                  Direct QR Studio &amp; Heritage Storytelling
                </h3>
                <p className="mt-3 text-sm text-[#615b56] leading-relaxed">
                  Sublime branded digital menus pairing tasting notes, provenance archives, and somatic pairing tips. Sommelier curated flows let guests pay and order straight at the table without app downloads.
                </p>

                <div className="mt-6 p-4 rounded-2xl bg-[#faf9f6] border border-[#eceae6] space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#1c1917]">
                    <span>Table-side QR Adoption</span>
                    <span className="text-[#873724] font-bold">91.4% Average</span>
                  </div>
                  <p className="text-[11px] text-[#78716c]">
                    88% of diners confirm our interface elevated their hospitality mood and speed.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-stone-100">
                <Link
                  href="/r/la-piazza"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#faf9f6] hover:bg-[#f0ede8] border border-[#eceae6] text-xs font-semibold text-[#1c1917] transition-colors"
                >
                  <QrCode className="w-4 h-4 text-[#873724]" />
                  <span>Launch La Piazza Guest QR Demo</span>
                </Link>
              </div>
            </div>

            {/* Card 3: Multi-Station Pass & Oven Synchronization (Col 5) */}
            <div id="kitchen-pass" className="lg:col-span-5 rounded-[28px] bg-white border border-[#eceae6] p-8 shadow-xs hover:shadow-card transition-shadow flex flex-col justify-between">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-full bg-[#e4f8ed] text-[#109955] text-[11px] font-bold uppercase tracking-wider">
                  Kitchen Sync
                </span>
                <h3 className="mt-4 text-2xl sm:text-3xl font-serif text-[#1c1917]">
                  Multi-Station Pass &amp; Oven Synchronization
                </h3>
                <p className="mt-3 text-sm text-[#615b56] leading-relaxed">
                  Smart Ticket Routing automatically splits courses between pass stations, tandoors, saute lines, and cold larder. Courtesies and cellar alerts are staged so meals arrive together.
                </p>

                <div className="mt-6 p-3.5 rounded-xl bg-[#fff6e5] border border-amber-200 text-xs text-[#92400e] flex items-center gap-3">
                  <ChefHat className="w-5 h-5 text-[#d97706] shrink-0" />
                  <div>
                    <span className="font-bold block">Course Service Sync</span>
                    <span className="text-[11px]">Fired 4m ago • Entrée plate readiness in 2m</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-[#78716c]">
                <span>Zero kitchen paper jams</span>
                <span className="font-semibold text-[#109955]">100% Realtime</span>
              </div>
            </div>

            {/* Card 4: Dark Cocoa Terracotta Card: Use Any Device · Never Stop Serving (Col 7) */}
            <div className="lg:col-span-7 rounded-[28px] bg-[#2e1a16] text-[#faf9f6] p-8 shadow-xl relative overflow-hidden flex flex-col justify-between">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#873724]/25 rounded-full blur-3xl pointer-events-none" />

              <div>
                <span className="inline-block px-2.5 py-1 rounded-full bg-[#873724] text-[#faeae6] text-[11px] font-bold uppercase tracking-wider">
                  Zero-Downtime Engine
                </span>
                <h3 className="mt-4 text-2xl sm:text-3xl font-serif text-white">
                  Use Any Device · Never Stop Serving.
                </h3>
                <p className="mt-3 text-sm text-[#d4cec7] leading-relaxed">
                  Hardware agnostic architecture runs everywhere you need it, from retrofitted terminal registers to kitchen tablet displays. Even when the internet drops, local peer-to-peer sync guarantees service never halts.
                </p>

                {/* 3 Device Pills */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-medium">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <Tablet className="w-4 h-4 text-amber-400 mb-1" />
                    <span className="font-semibold block text-white">Apple iPad Fleet</span>
                    <span className="text-[10px] text-stone-400">Safari offline cached</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <Layers className="w-4 h-4 text-emerald-400 mb-1" />
                    <span className="font-semibold block text-white">Kitchen Screens</span>
                    <span className="text-[10px] text-stone-400">Heavy-duty touch</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <Smartphone className="w-4 h-4 text-amber-300 mb-1" />
                    <span className="font-semibold block text-white">Direct Table Mobile</span>
                    <span className="text-[10px] text-stone-400">Pay at Table QR</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-stone-400">
                <span>Enterprise grade local mesh redundancy</span>
                <span className="text-amber-400 font-semibold">Offline SLA: 100%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Editorial Testimonial Quote Section */}
      <section className="py-20 md:py-24 bg-[#1f4e47] text-white relative overflow-hidden">
        {/* Subtle decorative concentric circle watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Diamond Ornaments */}
          <div className="flex items-center justify-center gap-3 text-[#efa736] mb-6 text-xs tracking-widest">
            <span>◆</span>
            <span>◆</span>
            <span>◆</span>
            <span>◆</span>
            <span>◆</span>
          </div>

          {/* Testimonial Quote */}
          <blockquote className="text-xl sm:text-3xl lg:text-4xl font-serif italic leading-relaxed text-[#faf9f6]">
            &ldquo;In our 180-seat courtyard palace, hospitality is a dance of intimacy and tradition. Most POS systems feel like brutalist software built for fast-food counters. BitePoint gave us the elegance of fine dining cadence while keeping our kitchens firing at hyper-scale speed.&rdquo;
          </blockquote>

          {/* Author */}
          <div className="mt-8 flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#133e36] border border-[#efa736]/40 flex items-center justify-center font-bold font-sans text-sm text-[#efa736]">
              AR
            </div>
            <div>
              <p className="font-semibold text-base text-white">Chef Arjun Rajawat</p>
              <p className="text-xs text-emerald-200">Culinary Director &amp; Proprietor, The Amber Courtyard</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Transparent Plans & Pricing */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-[11px] font-bold tracking-widest uppercase text-[#1f4e47]">
              FAIR ARCHITECTURE FOR CULINARY EXCELLENCE
            </p>
            <h2 className="mt-3 text-3xl sm:text-5xl font-serif text-[#1c1917]">
              Transparent plans. No hidden interchange fees.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#615b56]">
              Pick the right operational scale for your dining room. 14 days free on all plans.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {/* Starter Bistro */}
            <div className="rounded-[28px] bg-white border border-[#eceae6] p-8 shadow-xs hover:shadow-card transition-all flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#1c1917]">Starter Bistro</h3>
                <p className="mt-2 text-xs text-[#78716c] min-h-[32px]">
                  For boutique bistros, wine bars &amp; cellar tasting rooms.
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-serif font-bold text-[#1c1917]">$69</span>
                  <span className="text-xs text-[#78716c]">/month billed annually</span>
                </div>

                <ul className="mt-8 space-y-3 text-xs text-[#615b56]">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#109955] shrink-0" />
                    <span>Up to 12 QR table terminals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#109955] shrink-0" />
                    <span>Standard Single-Zone Floor Radar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#109955] shrink-0" />
                    <span>Instant KDS Kitchen Display</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#109955] shrink-0" />
                    <span>Offline Cache Protection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#109955] shrink-0" />
                    <span>Public customer guest ordering</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-stone-100">
                <Link href="/register">
                  <Button variant="outline" className="w-full rounded-xl border-[#dcd7d0] text-xs font-semibold py-2.5">
                    Experience Free
                  </Button>
                </Link>
              </div>
            </div>

            {/* Pro Hospitality (FEATURED) */}
            <div className="rounded-[28px] bg-white border-2 border-[#1f4e47] p-8 shadow-xl relative flex flex-col justify-between scale-[1.02]">
              {/* Featured Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-[#1f4e47] text-[#efa736] text-[10px] font-bold uppercase tracking-wider shadow-sm">
                MOST CHOSEN BY HERITAGE RESTAURANTS
              </div>

              <div>
                <h3 className="text-xl font-serif font-bold text-[#1c1917]">Pro Hospitality</h3>
                <p className="mt-2 text-xs text-[#78716c] min-h-[32px]">
                  For high-cadence dining rooms requiring expanded pass sync and multiple zones.
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-serif font-bold text-[#1f4e47]">$149</span>
                  <span className="text-xs text-[#78716c]">/month billed annually</span>
                </div>

                <ul className="mt-8 space-y-3 text-xs text-[#1c1917] font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#1f4e47] shrink-0" />
                    <span>Unlimited floor terminals &amp; reservations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#1f4e47] shrink-0" />
                    <span>Architectural Multi-Zone Floor Radar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#1f4e47] shrink-0" />
                    <span>Smart KDS Routing (Pass, Grill, Prep)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#1f4e47] shrink-0" />
                    <span>Sommelier Pairing Engine / Tap &amp; Split Table</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#1f4e47] shrink-0" />
                    <span>Sommelier &amp; Course Pacing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#1f4e47] shrink-0" />
                    <span>24/7 Dedicated Floor Support</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-stone-100">
                <Link href="/register">
                  <Button className="w-full rounded-xl bg-[#efa736] hover:bg-[#e09827] text-stone-950 text-xs font-bold py-2.5 shadow-md">
                    Claim 14-Day Free Access
                  </Button>
                </Link>
              </div>
            </div>

            {/* Heritage Group */}
            <div className="rounded-[28px] bg-white border border-[#eceae6] p-8 shadow-xs hover:shadow-card transition-all flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#1c1917]">Heritage Group</h3>
                <p className="mt-2 text-xs text-[#78716c] min-h-[32px]">
                  For multi-property collections, boutique hotel dining groups, and legacy estates.
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-3xl font-serif font-bold text-[#1c1917]">Custom</span>
                  <span className="text-xs text-[#78716c]">tailored to your volume</span>
                </div>

                <ul className="mt-8 space-y-3 text-xs text-[#615b56]">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#109955] shrink-0" />
                    <span>Multi-property centralized menu synchronization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#109955] shrink-0" />
                    <span>Custom POS &amp; Opera PMS Integrations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#109955] shrink-0" />
                    <span>Dedicated concierge account manager</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#109955] shrink-0" />
                    <span>Custom Hardware Provisioning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#109955] shrink-0" />
                    <span>99.99% SLA Guarantee</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-stone-100">
                <Link href="/register">
                  <Button variant="outline" className="w-full rounded-xl border-[#dcd7d0] text-xs font-semibold py-2.5">
                    Contact Culinary Architect
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Pre-Footer Call To Action Banner */}
      <section className="py-16 md:py-20 bg-[#1f4e47] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif text-white">
            Ready to bring effortless grace to your floor?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-emerald-100 max-w-xl mx-auto">
            Set up in under 10 minutes. Import your existing menu with one click with nothing to install and risk free for 14 days.
          </p>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/register?email=${encodeURIComponent(emailInput)}`;
            }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto"
          >
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your restaurant email"
              required
              className="w-full sm:flex-1 px-4 py-3 rounded-xl bg-white text-[#1c1917] text-xs placeholder:text-[#a8a29e] border-none focus:outline-none focus:ring-2 focus:ring-[#efa736]"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#efa736] hover:bg-[#e09827] text-stone-950 text-xs font-bold transition-colors whitespace-nowrap shadow-sm"
            >
              Start 14-Day Free
            </button>
          </form>

          <p className="mt-4 text-[11px] text-emerald-200/80">
            No credit card required. Instant 14-day full production trial access.
          </p>
        </div>
      </section>

      {/* 9. Architectural Footer */}
      <footer className="bg-[#fbf7f2] text-[#1c1917] border-t border-[#eceae6] pt-16 pb-0 overflow-hidden relative">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top 4-Column Directory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12">
            {/* Col 1: Brand & Concierge (Col 4) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1f4e47] text-[#efa736] flex items-center justify-center shadow-xs">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2zm4 8h-2v-4h2v4zm0-6h-2V7h2v4z"/>
                  </svg>
                </div>
                <span className="text-xl font-serif font-bold text-[#1c1917]">BitePoint</span>
              </div>
              <p className="text-xs text-[#78716c] leading-relaxed max-w-sm">
                BitePoint crafts fine-dining heritage software for elevated dining rooms, courtyard restaurants, and artisanal culinary spaces across the globe. Preserving culinary traditions while mastering floor velocity, ambiance, and rhythm.
              </p>
              <div className="text-xs text-[#78716c] space-y-1 pt-2">
                <p>Hospitality Concierge: <a href="mailto:concierge@bitepoint.co" className="text-[#873724] font-medium hover:underline">concierge@bitepoint.co</a></p>
                <p>Hospitality Desk: <span className="font-semibold text-[#1c1917]">+1 (800) 412-8872</span></p>
              </div>
            </div>

            {/* Col 2: Heritage Suite (Col 2) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#1c1917]">HERITAGE SUITE</h4>
              <ul className="space-y-2 text-xs text-[#78716c]">
                <li><Link href="#operations" className="hover:text-[#1c1917] transition-colors">Core Suite Tour</Link></li>
                <li><Link href="#floor-radar" className="hover:text-[#1c1917] transition-colors">Architectural Floor Radar</Link></li>
                <li><Link href="#kitchen-pass" className="hover:text-[#1c1917] transition-colors">Split Sommelier KDS</Link></li>
                <li><Link href="/r/la-piazza" className="hover:text-[#1c1917] transition-colors">Sommelier Pairing Engine</Link></li>
                <li><Link href="#pricing" className="hover:text-[#1c1917] transition-colors">Hardware Bundles</Link></li>
              </ul>
            </div>

            {/* Col 3: Governance (Col 2) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#1c1917]">GOVERNANCE</h4>
              <ul className="space-y-2 text-xs text-[#78716c]">
                <li><span className="hover:text-[#1c1917] cursor-pointer transition-colors">Culinary Data Privacy</span></li>
                <li><span className="hover:text-[#1c1917] cursor-pointer transition-colors">Offline Isolation Policy</span></li>
                <li><span className="hover:text-[#1c1917] cursor-pointer transition-colors">Subsidized Hardware</span></li>
                <li><span className="hover:text-[#1c1917] cursor-pointer transition-colors">Privacy &amp; Security</span></li>
                <li><span className="hover:text-[#1c1917] cursor-pointer transition-colors">Terms of Service</span></li>
              </ul>
            </div>

            {/* Col 4: Newsletter Digest (Col 4) */}
            <div className="lg:col-span-4 space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#1c1917]">
                THE HERITAGE SERVICE DIGEST
              </h4>
              <p className="text-xs text-[#78716c] leading-relaxed">
                A twice-monthly confidential summary of guest experience design, floor psychology, and fine kitchen operational cadence.
              </p>

              {newsletterSubscribed ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Thank you for subscribing to the Heritage Digest.</span>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newsletterEmail) setNewsletterSubscribed(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter email address"
                    required
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#e4dfd7] text-xs text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none focus:ring-1 focus:ring-[#873724]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-[#873724] hover:bg-[#732f1e] text-white text-xs font-semibold transition-colors shrink-0"
                  >
                    Subscribe
                  </button>
                </form>
              )}
              <p className="text-[10px] text-[#a8a29e]">
                No spam. Unsubscribe anytime with one click.
              </p>
            </div>
          </div>

          {/* Interactive Role Tester Panel (Quick access bar) */}
          <div className="mb-6 p-3 rounded-2xl bg-white/80 border border-[#eceae6] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-[#1c1917]">Quick Test Switcher:</span>
              <span className="text-[#78716c] hidden sm:inline">Launch any role directly without typing:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/login?redirect=/dashboard"
                className="px-3 py-1.5 rounded-lg bg-[#873724] text-white text-xs font-semibold hover:bg-[#732f1e] transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Owner Dashboard</span>
              </Link>
              <Link
                href="/login?redirect=/admin"
                className="px-3 py-1.5 rounded-lg bg-[#1f4e47] text-white text-xs font-semibold hover:bg-[#183e38] transition-colors flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Super Admin</span>
              </Link>
              <Link
                href="/r/la-piazza"
                className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#1c1917] text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Customer QR Menu</span>
              </Link>
            </div>
          </div>

          {/* Copyright line */}
          <div className="py-4 border-t border-[#eceae6] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#78716c]">
            <p>© 2026 BitePoint Hospitality Operating System Inc. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#109955]" />
                <span>In Safe Hands: Tier 4 Certified Cloud</span>
              </span>
              <span>•</span>
              <span>System Status: Operational</span>
            </div>
          </div>
        </div>

        {/* 🌟 ICONIC INDIAN HERITAGE MONUMENTS ARCHITECTURAL SKYLINE 🌟 */}
        <div className="w-full relative mt-2 pointer-events-none select-none flex justify-center overflow-hidden">
          <div className="w-full max-w-[1600px] px-2">
            <img
              src="/images/heritage-skyline.png"
              alt="Indian Heritage Monuments Architectural Skyline - Qutub Minar, Jama Masjid, India Gate, Taj Mahal, Humayun's Tomb, Red Fort"
              className="w-full h-auto object-contain object-bottom max-h-[160px] opacity-95 transition-opacity"
              loading="lazy"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
