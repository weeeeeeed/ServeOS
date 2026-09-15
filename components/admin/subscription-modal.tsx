'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CreditCard,
  Calendar,
  AlertCircle,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TenantWithDetails, SubscriptionPlan, SubscriptionStatus } from '@/lib/types';
import { AdminService } from '@/lib/admin-service';

interface SubscriptionModalProps {
  isOpen: boolean;
  tenant: TenantWithDetails | null;
  onClose: () => void;
  onSaved: () => void;
}

const PLANS: { name: SubscriptionPlan; price: string; features: string }[] = [
  { name: 'Starter', price: '$29/mo', features: 'Up to 25 dishes, 10 table QR codes' },
  { name: 'Pro', price: '$79/mo', features: 'Unlimited dishes, live KDS, table ordering, analytics' },
  { name: 'Enterprise', price: '$199/mo', features: 'Multi-location, priority kitchen dispatch, SLA' },
];

export function SubscriptionModal({
  isOpen,
  tenant,
  onClose,
  onSaved,
}: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('Pro');
  const [status, setStatus] = useState<SubscriptionStatus>('active');
  const [expiryDate, setExpiryDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tenant) {
      setSelectedPlan(tenant.subscriptionPlan || 'Pro');
      setStatus(tenant.subscription_status || 'active');

      const defaultExp = tenant.subscriptionExpiry
        ? new Date(tenant.subscriptionExpiry).toISOString().split('T')[0]
        : new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];
      setExpiryDate(defaultExp);
    }
    setError(null);
  }, [tenant, isOpen]);

  if (!isOpen || !tenant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expiryDate) {
      setError('Please select an expiry date');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await AdminService.updateTenantSubscription(tenant.id, {
        plan: selectedPlan,
        expiryDate: new Date(expiryDate).toISOString(),
        status,
      });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDuration = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    setExpiryDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-elevated overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Manage Tenant Subscription
              </h2>
              <p className="text-xs text-zinc-500">
                {tenant.name} &bull; /r/{tenant.slug}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Plan Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Select SaaS Pricing Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PLANS.map((p) => {
                const isSelected = selectedPlan === p.name;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setSelectedPlan(p.name)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/30 ring-1 ring-brand-600'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 bg-white dark:bg-zinc-900'
                    }`}
                  >
                    <span className="text-xs font-black block text-zinc-900 dark:text-zinc-100">{p.name}</span>
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400 block mt-0.5">{p.price}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subscription Status */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              Account Contract Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
              className="w-full h-10 px-3 py-2 text-xs font-semibold bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none"
            >
              <option value="active">🟢 Active (Full Access)</option>
              <option value="trialing">🔵 14-Day Free Trial</option>
              <option value="past_due">🟡 Past Due (Grace Period)</option>
              <option value="inactive">⚪ Inactive / Suspended</option>
              <option value="canceled">🔴 Canceled</option>
            </select>
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Contract Expiry Date
            </label>
            <Input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="text-xs h-10"
              required
            />

            <div className="flex gap-1.5 pt-1">
              <span className="text-[11px] text-zinc-400 self-center mr-1">Extend:</span>
              <button
                type="button"
                onClick={() => handleQuickDuration(1)}
                className="px-2 py-0.5 rounded-lg border text-[11px] font-semibold bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                +1 Month
              </button>
              <button
                type="button"
                onClick={() => handleQuickDuration(6)}
                className="px-2 py-0.5 rounded-lg border text-[11px] font-semibold bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                +6 Months
              </button>
              <button
                type="button"
                onClick={() => handleQuickDuration(12)}
                className="px-2 py-0.5 rounded-lg border text-[11px] font-semibold bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                +1 Year
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isLoading} className="gap-1.5 font-bold">
              <span>Update Subscription</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
