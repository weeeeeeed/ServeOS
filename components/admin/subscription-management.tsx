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
        return <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#faf9f6] text-stone-700 border border-stone-200">Starter ($29/mo)</span>;
      case 'Pro':
        return <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-[#1f4e47] border border-emerald-200">Pro ($79/mo)</span>;
      case 'Enterprise':
      case 'Growth':
        return <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">Enterprise ($199/mo)</span>;
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
        <div className="p-6 bg-white border border-stone-200 rounded-[28px] shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-stone-400">Starter Tier</span>
            <span className="text-sm font-black text-stone-900">$29 / mo</span>
          </div>
          <p className="text-xs text-stone-500">Up to 25 dishes, 10 table QR codes, contactless dining menu</p>
          <div className="pt-2 text-xs font-bold text-stone-700">
            {subscriptions.filter((s) => s.plan === 'Starter').length} active tenants
          </div>
        </div>

        <div className="p-6 bg-[#faf9f6] border-2 border-[#efa736] rounded-[28px] shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1f4e47] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#efa736]" />
              <span>Pro Tier (Standard)</span>
            </span>
            <span className="text-sm font-black text-stone-900">$79 / mo</span>
          </div>
          <p className="text-xs text-stone-500">Unlimited dishes, live kitchen KDS, ordering cart, guest analytics</p>
          <div className="pt-2 text-xs font-bold text-[#1f4e47]">
            {subscriptions.filter((s) => s.plan === 'Pro').length} active tenants
          </div>
        </div>

        <div className="p-6 bg-white border border-stone-200 rounded-[28px] shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">Enterprise Tier</span>
            <span className="text-sm font-black text-stone-900">$199 / mo</span>
          </div>
          <p className="text-xs text-stone-500">Multi-branch restaurant chains, custom domain branding, 24/7 SLA</p>
          <div className="pt-2 text-xs font-bold text-amber-800">
            {subscriptions.filter((s) => s.plan === 'Enterprise' || s.plan === 'Growth').length} active tenants
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search subscriptions by restaurant or plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#faf9f6] border border-stone-200 rounded-xl focus:outline-none focus:border-[#efa736] focus:ring-[#efa736]/20 text-stone-800 placeholder:text-stone-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {(['all', 'active', 'trialing', 'past_due', 'canceled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-[#1f4e47] text-[#efa736] shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {st === 'all' ? 'All Contracts' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white border border-stone-200 rounded-[28px] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200/80 bg-[#faf9f6] text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Restaurant Tenant</th>
                <th className="px-5 py-3.5">Subscription Plan</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Contract Expiry</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filteredSubscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-[#faf9f6]/70 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-stone-900">
                        {sub.restaurant?.name || 'Restaurant Tenant'}
                      </span>
                      <span className="text-[11px] text-stone-400 font-mono">
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
                      <span className="font-medium text-stone-800">
                        {new Date(sub.expiry_date).toLocaleDateString()}
                      </span>
                      <span className={`text-[10px] font-semibold ${
                        sub.status === 'past_due' || new Date(sub.expiry_date).getTime() < Date.now()
                          ? 'text-red-500'
                          : 'text-stone-400'
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
                      className="text-xs h-8 px-2.5 gap-1 border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-[#1f4e47]" />
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
