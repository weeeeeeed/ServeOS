'use client';

import React, { useState } from 'react';
import {
  Store,
  ExternalLink,
  MoreVertical,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  CreditCard,
  Trash2,
  Power,
} from 'lucide-react';
import { TenantWithDetails, SubscriptionStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { AdminService } from '@/lib/admin-service';
import { RestaurantDetailModal } from './restaurant-detail-modal';
import { SubscriptionModal } from './subscription-modal';

interface TenantTableProps {
  tenants: TenantWithDetails[];
  onRefresh: () => void;
}

export function TenantTable({ tenants, onRefresh }: TenantTableProps) {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingTenantId, setUpdatingTenantId] = useState<string | null>(null);

  // Modals state
  const [selectedForDetails, setSelectedForDetails] = useState<TenantWithDetails | null>(null);
  const [selectedForSubscription, setSelectedForSubscription] = useState<TenantWithDetails | null>(null);
  const [tenantToDelete, setTenantToDelete] = useState<TenantWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async (tenantId: string, newStatus: SubscriptionStatus) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    setUpdatingTenantId(tenantId);
    try {
      await AdminService.updateTenantStatus(tenantId, newStatus);
      onRefresh();
      toast.info('Account Status Updated', `${tenant?.name || 'Restaurant'} is now ${newStatus}`);
    } catch (err: any) {
      console.error('Failed to update tenant status:', err);
      toast.error('Failed to update status', err?.message);
    } finally {
      setUpdatingTenantId(null);
    }
  };

  const handleDeleteTenant = async () => {
    if (!tenantToDelete) return;
    setIsDeleting(true);
    try {
      await AdminService.deleteTenant(tenantToDelete.id);
      toast.success('Restaurant Deleted', `${tenantToDelete.name} was permanently removed`);
      setTenantToDelete(null);
      onRefresh();
    } catch (err: any) {
      console.error('Failed to delete tenant:', err);
      toast.error('Failed to delete restaurant', err?.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tenant.owner?.name && tenant.owner.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tenant.owner?.email && tenant.owner.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || tenant.subscription_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by restaurant name, slug, or owner email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#faf9f6] border border-stone-200 rounded-xl focus:outline-none focus:border-[#efa736] focus:ring-[#efa736]/20 text-stone-800 placeholder:text-stone-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            {(['all', 'active', 'trialing', 'past_due', 'inactive'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-[#1f4e47] text-[#efa736] shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {st === 'all' ? 'All Tenants' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-stone-200 rounded-[28px] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200/80 bg-[#faf9f6] text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Establishment</th>
                <th className="px-5 py-3.5">Owner Account</th>
                <th className="px-5 py-3.5">Plan & Tier</th>
                <th className="px-5 py-3.5">Account Status</th>
                <th className="px-5 py-3.5 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-stone-500">
                    <Store className="w-8 h-8 mx-auto text-stone-400 mb-2" />
                    <p className="font-semibold text-sm">No restaurants found</p>
                    <p className="text-xs text-stone-400">Try adjusting your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className="hover:bg-[#faf9f6]/70 transition-colors"
                  >
                    {/* Restaurant Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center font-bold text-sm text-stone-700 overflow-hidden shrink-0 border border-stone-200">
                          {tenant.logo ? (
                            <img
                              src={tenant.logo}
                              alt={tenant.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            tenant.name.charAt(0)
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-stone-900 truncate max-w-[180px]">
                            {tenant.name}
                          </span>
                          <a
                            href={`/r/${tenant.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#1f4e47] hover:underline inline-flex items-center gap-0.5 font-mono font-semibold"
                          >
                            <span>/r/{tenant.slug}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Owner Info */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-stone-800">
                          {tenant.owner?.name || 'Marco Rossi'}
                        </span>
                        <span className="text-[11px] text-stone-400 font-mono">
                          {tenant.owner?.email || 'owner@demo.com'}
                        </span>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 bg-[#faf9f6] border border-stone-200 px-2.5 py-0.5 rounded-lg text-xs">
                          {tenant.subscriptionPlan || 'Pro'}
                        </span>
                        <button
                          onClick={() => setSelectedForSubscription(tenant)}
                          className="p-1 text-stone-400 hover:text-[#1f4e47] rounded"
                          title="Change Plan"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Status & Quick Toggle */}
                    <td className="px-5 py-4">
                      <select
                        value={tenant.subscription_status}
                        disabled={updatingTenantId === tenant.id}
                        onChange={(e) =>
                          handleStatusChange(
                            tenant.id,
                            e.target.value as SubscriptionStatus
                          )
                        }
                        className="text-xs font-semibold py-1 px-2.5 rounded-lg bg-[#faf9f6] border border-stone-200 text-stone-900 focus:outline-none focus:border-[#efa736]"
                      >
                        <option value="active">🟢 Active</option>
                        <option value="trialing">🔵 Trialing</option>
                        <option value="past_due">🟡 Past Due</option>
                        <option value="inactive">⚪ Inactive</option>
                        <option value="canceled">🔴 Canceled</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedForDetails(tenant)}
                          className="text-xs h-8 px-2.5 gap-1 border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </Button>

                        <button
                          onClick={() => setTenantToDelete(tenant)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete Restaurant"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restaurant Detail Modal */}
      {selectedForDetails && (
        <RestaurantDetailModal
          tenant={selectedForDetails}
          onClose={() => setSelectedForDetails(null)}
          onEditSubscription={(t) => setSelectedForSubscription(t)}
        />
      )}

      {/* Subscription Modal */}
      {selectedForSubscription && (
        <SubscriptionModal
          isOpen={true}
          tenant={selectedForSubscription}
          onClose={() => setSelectedForSubscription(null)}
          onSaved={() => {
            onRefresh();
            toast.success('Subscription Updated', 'Plan and validity successfully modified');
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {tenantToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] p-6 max-w-sm w-full shadow-board border border-stone-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-stone-900">
                Delete Restaurant?
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-stone-900">{tenantToDelete.name}</strong>? This action cascades across all categories, dishes, orders, and subscriptions.
              </p>
            </div>
            <div className="pt-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTenantToDelete(null)}
                className="flex-1 text-xs border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDeleteTenant}
                isLoading={isDeleting}
                className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
