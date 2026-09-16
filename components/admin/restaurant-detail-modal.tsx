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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto antialiased">
      <div className="relative w-full max-w-2xl bg-white border border-stone-200 rounded-[32px] shadow-board overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-start justify-between bg-[#faf9f6]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1f4e47] text-[#efa736] flex items-center justify-center font-bold text-2xl shadow-xs overflow-hidden shrink-0">
              {tenant.logo ? (
                <img src={tenant.logo} alt={tenant.name} className="w-full h-full object-cover" />
              ) : (
                <span>{tenant.name.charAt(0)}</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-stone-900">
                  {tenant.name}
                </h2>
                <Badge status={tenant.subscription_status} />
              </div>
              <p className="text-xs text-stone-500 font-mono mt-0.5">
                /r/{tenant.slug} &bull; ID: {tenant.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close details"
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-[#faf9f6] rounded-2xl border border-stone-200">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Menu Items</span>
              <div className="text-xl font-black text-stone-900 mt-1">
                {tenant.totalMenuItems || 8}
              </div>
              <span className="text-[10px] text-stone-400">{tenant.totalCategories || 4} categories</span>
            </div>

            <div className="p-4 bg-[#faf9f6] rounded-2xl border border-stone-200">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Total Orders</span>
              <div className="text-xl font-black text-stone-900 mt-1">
                {tenant.totalOrders || 42}
              </div>
              <span className="text-[10px] text-stone-400">QR table tickets</span>
            </div>

            <div className="p-4 bg-[#faf9f6] rounded-2xl border border-stone-200">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Gross Sales</span>
              <div className="text-xl font-black text-[#1f4e47] mt-1">
                ${(tenant.grossRevenue || 1420.50).toFixed(2)}
              </div>
              <span className="text-[10px] text-stone-400">Total volume</span>
            </div>

            <div className="p-4 bg-[#faf9f6] rounded-2xl border border-stone-200">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Plan Tier</span>
              <div className="text-sm font-black text-[#1f4e47] mt-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#efa736]" />
                <span>{tenant.subscriptionPlan || 'Pro'}</span>
              </div>
              <span className="text-[10px] text-stone-400">SaaS Contract</span>
            </div>
          </div>

          {/* Owner Account Details */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-400">
              Tenant Owner Information
            </h3>
            <div className="p-4 bg-[#faf9f6] rounded-2xl border border-stone-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-800">
                  <User className="w-4 h-4 text-stone-400" />
                  <span className="font-bold">{tenant.owner?.name || 'Marco Rossi'}</span>
                </div>
                <span className="text-[11px] text-stone-400 font-mono">Owner UID: {tenant.owner_id.slice(-8)}</span>
              </div>

              <div className="flex items-center gap-2 text-stone-800">
                <Mail className="w-4 h-4 text-stone-400" />
                <span>{tenant.owner?.email || 'owner@demo.com'}</span>
              </div>
            </div>
          </div>

          {/* Operational Details */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-400">
              Establishment Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-[#faf9f6] rounded-2xl border border-stone-200 space-y-1">
                <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Opening Hours</span>
                </span>
                <p className="font-semibold text-stone-800">
                  {tenant.opening_hours || 'Mon - Sun: 11:30 AM - 11:00 PM'}
                </p>
              </div>

              <div className="p-3.5 bg-[#faf9f6] rounded-2xl border border-stone-200 space-y-1">
                <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>Phone Number</span>
                </span>
                <p className="font-semibold text-stone-800">
                  {tenant.phone || '+1 (212) 555-0199'}
                </p>
              </div>

              <div className="p-3.5 bg-[#faf9f6] rounded-2xl border border-stone-200 space-y-1 sm:col-span-2">
                <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>Address</span>
                </span>
                <p className="font-semibold text-stone-800">
                  {tenant.address || '142 Via Della Spiga, Little Italy, NY 10013'}
                </p>
              </div>
            </div>
          </div>

          {/* Subscription Validity */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-[#1f4e47] block">
                Subscription Plan: {tenant.subscriptionPlan || 'Pro'} Tier
              </span>
              <span className="text-[11px] text-stone-500">
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
                className="text-xs font-bold bg-white border border-stone-200 hover:bg-stone-50 text-stone-800"
              >
                Change Plan
              </Button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-[#faf9f6] flex items-center justify-between">
          <a
            href={`/r/${tenant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#1f4e47] hover:underline flex items-center gap-1 font-bold"
          >
            <QrCode className="w-3.5 h-3.5 text-[#efa736]" />
            <span>Open Public Dining Menu</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <Button
            size="sm"
            onClick={onClose}
            className="text-xs bg-[#efa736] hover:bg-[#e09827] text-stone-950 font-bold rounded-xl px-5"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
