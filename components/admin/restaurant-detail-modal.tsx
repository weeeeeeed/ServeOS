'use client';

import React from 'react';
import {
  X,
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
  Utensils,
  Layers,
  ShoppingBag,
  DollarSign,
  Calendar,
  Sparkles,
  ShieldCheck,
  QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TenantWithDetails } from '@/lib/types';

interface RestaurantDetailModalProps {
  tenant: TenantWithDetails | null;
  onClose: () => void;
  onEditSubscription?: (tenant: TenantWithDetails) => void;
}

export function RestaurantDetailModal({
  tenant,
  onClose,
  onEditSubscription,
}: RestaurantDetailModalProps) {
  if (!tenant) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-elevated overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between bg-zinc-50/50 dark:bg-zinc-950/40">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-2xl shadow-subtle overflow-hidden shrink-0">
              {tenant.logo ? (
                <img src={tenant.logo} alt={tenant.name} className="w-full h-full object-cover" />
              ) : (
                <span>{tenant.name.charAt(0)}</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                  {tenant.name}
                </h2>
                <Badge status={tenant.subscription_status} />
              </div>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                /r/{tenant.slug} &bull; ID: {tenant.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close details"
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Menu Items</span>
              <div className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
                {tenant.totalMenuItems || 8}
              </div>
              <span className="text-[10px] text-zinc-400">{tenant.totalCategories || 4} categories</span>
            </div>

            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total Orders</span>
              <div className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
                {tenant.totalOrders || 42}
              </div>
              <span className="text-[10px] text-zinc-400">QR table tickets</span>
            </div>

            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Gross Sales</span>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                ${(tenant.grossRevenue || 1420.50).toFixed(2)}
              </div>
              <span className="text-[10px] text-zinc-400">Total volume</span>
            </div>

            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Plan</span>
              <div className="text-sm font-black text-brand-600 dark:text-brand-400 mt-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{tenant.subscriptionPlan || 'Pro'}</span>
              </div>
              <span className="text-[10px] text-zinc-400">Tier Contract</span>
            </div>
          </div>

          {/* Owner Account Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Tenant Owner Information
            </h3>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <User className="w-4 h-4 text-zinc-400" />
                  <span className="font-bold">{tenant.owner?.name || 'Marco Rossi'}</span>
                </div>
                <span className="text-[11px] text-zinc-400 font-mono">Owner UID: {tenant.owner_id.slice(-8)}</span>
              </div>

              <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                <Mail className="w-4 h-4 text-zinc-400" />
                <span>{tenant.owner?.email || 'owner@demo.com'}</span>
              </div>
            </div>
          </div>

          {/* Operational Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Establishment Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Opening Hours</span>
                </span>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {tenant.opening_hours || 'Mon - Sun: 11:30 AM - 11:00 PM'}
                </p>
              </div>

              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>Phone Number</span>
                </span>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {tenant.phone || '+1 (212) 555-0199'}
                </p>
              </div>

              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60 space-y-1 sm:col-span-2">
                <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>Address</span>
                </span>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {tenant.address || '142 Via Della Spiga, Little Italy, NY 10013'}
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Validity */}
          <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/20 border border-brand-200/80 dark:border-brand-900/40 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-brand-950 dark:text-brand-200 block">
                Subscription Plan: {tenant.subscriptionPlan || 'Pro'} Tier
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Expires on {new Date(tenant.subscriptionExpiry || Date.now()).toLocaleDateString()}
              </span>
            </div>

            {onEditSubscription && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onEditSubscription(tenant);
                  onClose();
                }}
                className="text-xs font-bold"
              >
                Change Plan
              </Button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 flex items-center justify-between">
          <a
            href={`/r/${tenant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-600 hover:underline flex items-center gap-1 font-bold"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Open Public Dining Menu</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <Button variant="primary" size="sm" onClick={onClose} className="text-xs">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
