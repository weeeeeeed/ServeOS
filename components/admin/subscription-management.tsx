'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
  ArrowUpRight,
  Shield,
  Layers,
} from 'lucide-react';
import { SubscriptionWithRestaurant, SubscriptionPlan, SubscriptionStatus, TenantWithDetails } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SubscriptionModal } from './subscription-modal';

interface SubscriptionManagementProps {
  subscriptions: SubscriptionWithRestaurant[];
  onRefresh: () => void;
}

export function SubscriptionManagement({
  subscriptions,
  onRefresh,
}: SubscriptionManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTenantForEdit, setSelectedTenantForEdit] = useState<TenantWithDetails | null>(null);

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const restoName = sub.restaurant?.name || '';
    const ownerEmail = sub.owner?.email || '';
    const matchesSearch =
      restoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.plan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getPlanBadge = (plan: SubscriptionPlan) => {
    switch (plan) {
      case 'Starter':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">Starter ($29/mo)</span>;
      case 'Pro':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">Pro ($79/mo)</span>;
      case 'Enterprise':
      case 'Growth':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">Enterprise ($199/mo)</span>;
    }
  };

  const getDaysRemaining = (expiryDate: string) => {
    const diffMs = new Date(expiryDate).getTime() - Date.now();
    const days = Math.ceil(diffMs / 86400000);
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Expires today';
    return `${days} days left`;
  };

  return (
    <div className="space-y-6">
      {/* Pricing Tiers Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-card space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Starter Tier</span>
            <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">$29 / mo</span>
          </div>
          <p className="text-xs text-zinc-500">Up to 25 dishes, 10 table QR codes, contactless dining menu</p>
          <div className="pt-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
            {subscriptions.filter((s) => s.plan === 'Starter').length} active tenants
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border-2 border-brand-500/40 dark:border-brand-500/40 rounded-3xl shadow-card space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pro Tier (Most Popular)</span>
            </span>
            <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">$79 / mo</span>
          </div>
          <p className="text-xs text-zinc-500">Unlimited dishes, live kitchen KDS, ordering cart, guest analytics</p>
          <div className="pt-2 text-xs font-bold text-brand-600 dark:text-brand-400">
            {subscriptions.filter((s) => s.plan === 'Pro').length} active tenants
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-card space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Enterprise Tier</span>
            <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">$199 / mo</span>
          </div>
          <p className="text-xs text-zinc-500">Multi-branch restaurant chains, custom domain branding, 24/7 SLA</p>
          <div className="pt-2 text-xs font-bold text-purple-600 dark:text-purple-400">
            {subscriptions.filter((s) => s.plan === 'Enterprise' || s.plan === 'Growth').length} active tenants
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search subscriptions by restaurant or plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {(['all', 'active', 'trialing', 'past_due', 'canceled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
              }`}
            >
              {st === 'all' ? 'All Contracts' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Restaurant Tenant</th>
                <th className="px-5 py-3.5">Subscription Plan</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Contract Expiry</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
              {filteredSubscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {sub.restaurant?.name || 'Restaurant Tenant'}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {sub.owner?.email || 'owner@demo.com'}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    {getPlanBadge(sub.plan)}
                  </td>

                  <td className="px-5 py-4">
                    <Badge status={sub.status} />
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {new Date(sub.expiry_date).toLocaleDateString()}
                      </span>
                      <span className={`text-[10px] font-semibold ${
                        sub.status === 'past_due' || new Date(sub.expiry_date).getTime() < Date.now()
                          ? 'text-red-500'
                          : 'text-zinc-400'
                      }`}>
                        {getDaysRemaining(sub.expiry_date)}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (sub.restaurant) {
                          setSelectedTenantForEdit({
                            ...sub.restaurant,
                            owner: sub.owner ? { id: sub.restaurant.owner_id, name: sub.owner.name, email: sub.owner.email } : undefined,
                            subscriptionPlan: sub.plan,
                            subscriptionExpiry: sub.expiry_date,
                          });
                        }
                      }}
                      className="text-xs h-8 px-2.5 gap-1"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Modify Plan</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Modal */}
      {selectedTenantForEdit && (
        <SubscriptionModal
          isOpen={true}
          tenant={selectedTenantForEdit}
          onClose={() => setSelectedTenantForEdit(null)}
          onSaved={onRefresh}
        />
      )}
    </div>
  );
}
