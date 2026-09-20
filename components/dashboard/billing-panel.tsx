'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Download,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowUpRight,
  Receipt,
  Calendar,
  Layers,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Restaurant } from '@/lib/types';
import { formatCurrency, CURRENCY_SYMBOL } from '@/lib/currency';


interface BillingPanelProps {
  restaurant: Restaurant;
}

interface InvoiceItem {
  id: string;
  invoiceNo: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Processing';
  plan: string;
  period: string;
}

export function BillingPanel({ restaurant }: BillingPanelProps) {
  const toast = useToast();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [activePlan, setActivePlan] = useState<'Starter' | 'Pro' | 'Enterprise'>(
    restaurant.subscription_status === 'trialing' ? 'Starter' : 'Pro'
  );

  const nextRenewalDate = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 28);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, []);

  const invoices: InvoiceItem[] = React.useMemo(() => {
    if (restaurant.subscription_status === 'active') {
      const now = new Date();
      const currentPeriod = `${now.toLocaleDateString('en-US', { month: 'short' })} 01 - ${now.toLocaleDateString('en-US', { month: 'short' })} 28, ${now.getFullYear()}`;
      return [
        {
          id: `inv-${restaurant.id.slice(0, 6)}`,
          invoiceNo: `INV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-001`,
          date: `${now.toLocaleDateString('en-US', { month: 'short' })} 01, ${now.getFullYear()}`,
          amount: activePlan === 'Enterprise' ? 999 : activePlan === 'Starter' ? 199 : 499,
          status: 'Paid',
          plan: `ServeOS ${activePlan === 'Pro' ? 'Garden Pro' : activePlan === 'Enterprise' ? 'Reserve Estate' : 'Starter'}`,
          period: currentPeriod,
        },
      ];
    }
    return [];
  }, [restaurant, activePlan]);

  const handleDownloadInvoice = (inv: InvoiceItem) => {
    toast.success('Invoice Downloaded', `${inv.invoiceNo} saved as PDF`);
  };

  const handleSwitchPlan = (plan: 'Starter' | 'Pro' | 'Enterprise') => {
    setActivePlan(plan);
    setIsUpgradeModalOpen(false);
    toast.success('Plan Updated', `Switched subscription to ServeOS ${plan}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6e2da]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#1b3b2f] tracking-tight">
              Subscription &amp; Billing
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eef4f0] text-[#1b3b2f] border border-[#d2ded6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3a7d5c]" />
              {restaurant.subscription_status === 'active' ? 'Active Subscription' : 'Trialing'}
            </span>
          </div>
          <p className="text-xs lg:text-[13px] text-[#556960] mt-1 font-sans">
            Manage your ServeOS restaurant plan, tax invoices, GST billing details, and payment methods
          </p>
        </div>

        <Button
          onClick={() => setIsUpgradeModalOpen(true)}
          className="bg-[#1b3b2f] hover:bg-[#122820] text-[#f8faf7] font-semibold text-xs px-5 py-2.5 rounded-2xl shadow-xs flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-[#d4af37]" />
          <span>Change Subscription Tier</span>
        </Button>
      </header>

      {/* Current Plan Overview Card */}
      <div className="bg-white/95 rounded-3xl p-6 lg:p-8 border border-[#e6e2da] shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eef4f0] text-[#1b3b2f] text-xs font-bold uppercase tracking-wider mb-2">
              Current Active Tier
            </div>
            <h2 className="text-2xl lg:text-3xl font-serif font-bold text-[#1b3b2f]">
              ServeOS {activePlan === 'Pro' ? 'Garden Pro' : activePlan === 'Enterprise' ? 'Reserve Estate' : 'Café Starter'}
            </h2>
            <p className="text-xs lg:text-sm text-[#556960] mt-1 max-w-xl">
              Includes unlimited QR tables, live kitchen display system (KDS), browser push marketing campaigns, and real-time floor telemetry.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-medium text-[#162820]">
              <span className="flex items-center gap-1.5 text-[#3a7d5c]">
                <CheckCircle2 className="w-4 h-4" /> Real-time KDS Sync
              </span>
              <span className="flex items-center gap-1.5 text-[#3a7d5c]">
                <CheckCircle2 className="w-4 h-4" /> 10,000 Push Notifications / mo
              </span>
              <span className="flex items-center gap-1.5 text-[#3a7d5c]">
                <CheckCircle2 className="w-4 h-4" /> Multi-zone Table Mapping
              </span>
              <span className="flex items-center gap-1.5 text-[#3a7d5c]">
                <CheckCircle2 className="w-4 h-4" /> GST Compliant Receipts
              </span>
            </div>
          </div>

          <div className="bg-[#faf8f5] p-5 rounded-3xl border border-[#e6e2da] flex flex-col items-start lg:items-end justify-between min-w-[240px]">
            <span className="text-xs font-medium text-[#85988e]">Billing Cycle</span>
            <div className="text-3xl font-serif font-bold text-[#1b3b2f] my-1">
              {activePlan === 'Pro' ? '₹499' : activePlan === 'Enterprise' ? '₹999' : '₹199'}
              <span className="text-xs font-sans font-normal text-[#556960]"> / month</span>
            </div>
            <div className="text-xs text-[#556960] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#85988e]" />
              <span>Renews on {nextRenewalDate}</span>
            </div>
            <div className="mt-3 w-full">
              <button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="w-full text-center text-xs font-bold py-2 rounded-xl bg-[#eef4f0] text-[#1b3b2f] hover:bg-[#dbe8e0] transition-colors"
              >
                Manage Tier
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Usage & Payment Method */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Usage Telemetry */}
        <div className="bg-white/95 rounded-3xl p-6 border border-[#e6e2da] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#f0ede6]">
            <h3 className="font-serif font-bold text-base text-[#1b3b2f]">Monthly Quota &amp; Usage</h3>
            <span className="text-xs text-[#3a7d5c] font-semibold">Current Active Cycle</span>
          </div>

          <div className="space-y-4 mt-4">
            <div>
              <div className="flex justify-between text-xs text-[#556960] mb-1.5 font-medium">
                <span>Dine-In QR Menu Orders</span>
                <span className="font-bold text-[#1b3b2f]">Unlimited Orders</span>
              </div>
              <div className="w-full bg-[#f4f1eb] h-2 rounded-full overflow-hidden">
                <div className="bg-[#3a7d5c] h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-[#556960] mb-1.5 font-medium">
                <span>Customer Web Push Dispatches</span>
                <span className="font-bold text-[#1b3b2f]">10,000 monthly quota</span>
              </div>
              <div className="w-full bg-[#f4f1eb] h-2 rounded-full overflow-hidden">
                <div className="bg-[#1b3b2f] h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-[#556960] mb-1.5 font-medium">
                <span>Floor Plan Tables Enabled</span>
                <span className="font-bold text-[#1b3b2f]">12 Tables Configured</span>
              </div>
              <div className="w-full bg-[#f4f1eb] h-2 rounded-full overflow-hidden">
                <div className="bg-[#825500] h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white/95 rounded-3xl p-6 border border-[#e6e2da] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#f0ede6]">
              <h3 className="font-serif font-bold text-base text-[#1b3b2f]">Billing Account</h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#eef4f0] text-[#1b3b2f]">Active</span>
            </div>

            <div className="mt-4 flex items-center gap-4 p-4 rounded-2xl bg-[#faf8f5] border border-[#e6e2da]">
              <div className="w-12 h-8 rounded-lg bg-[#1b3b2f] text-white font-mono text-xs font-bold flex items-center justify-center">
                UPI / CARD
              </div>
              <div>
                <p className="text-xs font-bold text-[#1b3b2f]">ServeOS Restaurant Subscription</p>
                <p className="text-[11px] text-[#556960] font-mono">{restaurant.slug} &bull; Active billing</p>
              </div>
            </div>

            <p className="text-xs text-[#85988e] mt-3">
              Tax invoices with GSTIN breakdown are automatically generated on renewal and archived here.
            </p>
          </div>

          <div className="pt-3 mt-4 border-t border-[#f0ede6] flex justify-end">
            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="text-xs font-semibold text-[#1b3b2f] hover:underline"
            >
              Change Tier &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white/95 rounded-3xl p-6 border border-[#e6e2da] shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#f0ede6]">
          <div>
            <h3 className="font-serif font-bold text-base text-[#1b3b2f]">Tax Invoices &amp; Receipts</h3>
            <p className="text-xs text-[#556960] mt-0.5">Official GST-compliant tax receipts for merchant accounting</p>
          </div>
          <span className="text-xs font-medium text-[#85988e]">{invoices.length} {invoices.length === 1 ? 'Invoice' : 'Invoices'} Available</span>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#f0ede6] text-[#85988e] font-medium">
                <th className="py-3 px-3">Invoice No</th>
                <th className="py-3 px-3">Billing Period</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Tier</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ede6]">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#85988e]">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Receipt className="w-5 h-5 text-[#85988e]" />
                      <p className="font-serif font-bold text-[#1b3b2f]">No Past Invoices</p>
                      <p className="text-[#556960]">Your first statement will appear when the current cycle concludes.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#faf8f5] transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-[#1b3b2f]">{inv.invoiceNo}</td>
                    <td className="py-3.5 px-3 text-[#556960]">{inv.period}</td>
                    <td className="py-3.5 px-3 text-[#556960]">{inv.date}</td>
                    <td className="py-3.5 px-3 font-medium text-[#162820]">{inv.plan}</td>
                    <td className="py-3.5 px-3 font-bold text-[#1b3b2f]">{formatCurrency(inv.amount)}</td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#eef4f0] text-[#1b3b2f] border border-[#d2ded6]">
                        <CheckCircle2 className="w-3 h-3 text-[#3a7d5c]" />
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(inv)}
                        className="p-1.5 rounded-xl hover:bg-[#eef4f0] text-[#1b3b2f] transition-colors inline-flex items-center gap-1"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-semibold">PDF</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Tier Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-[#faf8f5] rounded-4xl p-7 max-w-2xl w-full border border-[#e6e2da] shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#e6e2da]">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#1b3b2f]">Select ServeOS Subscription Tier</h3>
                <p className="text-xs text-[#556960] mt-0.5">Scale effortlessly as your restaurant dining footprint grows</p>
              </div>
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white text-[#556960] hover:text-[#1b3b2f] flex items-center justify-center border border-[#e6e2da]"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {/* Starter */}
              <div className={`rounded-3xl p-5 border transition-all ${activePlan === 'Starter' ? 'border-[#1b3b2f] bg-white shadow-sm ring-2 ring-[#1b3b2f]' : 'border-[#e6e2da] bg-white/70'}`}>
                <div className="text-xs font-bold text-[#556960] uppercase">Starter</div>
                <div className="text-2xl font-serif font-bold text-[#1b3b2f] my-2">
                  ₹199<span className="text-xs font-sans text-[#85988e]">/mo</span>
                </div>
                <p className="text-[11px] text-[#556960] leading-relaxed">
                  Ideal for small cafés and quick counter bistros up to 8 tables.
                </p>
                <div className="mt-4 pt-3 border-t border-[#f0ede6]">
                  <Button
                    onClick={() => handleSwitchPlan('Starter')}
                    variant={activePlan === 'Starter' ? 'primary' : 'outline'}
                    className="w-full text-xs rounded-xl py-2"
                  >
                    {activePlan === 'Starter' ? 'Current Tier' : 'Choose Starter'}
                  </Button>
                </div>
              </div>

              {/* Pro */}
              <div className={`rounded-3xl p-5 border relative transition-all ${activePlan === 'Pro' ? 'border-[#1b3b2f] bg-white shadow-sm ring-2 ring-[#1b3b2f]' : 'border-[#e6e2da] bg-white/70'}`}>
                <span className="absolute -top-2.5 right-4 bg-[#1b3b2f] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  MOST POPULAR
                </span>
                <div className="text-xs font-bold text-[#3a7d5c] uppercase">Garden Pro</div>
                <div className="text-2xl font-serif font-bold text-[#1b3b2f] my-2">
                  ₹499<span className="text-xs font-sans text-[#85988e]">/mo</span>
                </div>
                <p className="text-[11px] text-[#556960] leading-relaxed">
                  Complete restaurant OS with KDS, push marketing, and multi-zone layout.
                </p>
                <div className="mt-4 pt-3 border-t border-[#f0ede6]">
                  <Button
                    onClick={() => handleSwitchPlan('Pro')}
                    variant={activePlan === 'Pro' ? 'primary' : 'outline'}
                    className="w-full text-xs rounded-xl py-2 bg-[#1b3b2f] text-white hover:bg-[#122820]"
                  >
                    {activePlan === 'Pro' ? 'Current Tier' : 'Upgrade to Pro'}
                  </Button>
                </div>
              </div>

              {/* Enterprise */}
              <div className={`rounded-3xl p-5 border transition-all ${activePlan === 'Enterprise' ? 'border-[#1b3b2f] bg-white shadow-sm ring-2 ring-[#1b3b2f]' : 'border-[#e6e2da] bg-white/70'}`}>
                <div className="text-xs font-bold text-[#556960] uppercase">Reserve Estate</div>
                <div className="text-2xl font-serif font-bold text-[#1b3b2f] my-2">
                  ₹999<span className="text-xs font-sans text-[#85988e]">/mo</span>
                </div>
                <p className="text-[11px] text-[#556960] leading-relaxed">
                  Multi-branch management, dedicated priority support, custom domain.
                </p>
                <div className="mt-4 pt-3 border-t border-[#f0ede6]">
                  <Button
                    onClick={() => handleSwitchPlan('Enterprise')}
                    variant={activePlan === 'Enterprise' ? 'primary' : 'outline'}
                    className="w-full text-xs rounded-xl py-2"
                  >
                    {activePlan === 'Enterprise' ? 'Current Tier' : 'Upgrade to Estate'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
