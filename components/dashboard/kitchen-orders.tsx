'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bell,
  Utensils,
  Filter,
  Search,
  RefreshCw,
  Printer,
  X,
  Sparkles,
  Layers,
  ChevronRight,
  Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { OrderWithItems, OrderStatus } from '@/lib/types';
import { OrderService } from '@/lib/order-service';
import { formatCurrency } from '@/lib/currency';

interface KitchenOrdersProps {
  restaurantId: string;
  onStatsChange?: () => void;
}

export function KitchenOrders({ restaurantId, onStatsChange }: KitchenOrdersProps) {
  const toast = useToast();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<OrderWithItems | null>(null);

  const loadOrders = async () => {
    if (!restaurantId) return;
    try {
      const data = await OrderService.getRestaurantOrders(restaurantId);
      setOrders(data);
    } catch (err) {
      console.error('Failed to load kitchen orders:', err);
      toast.error('Error syncing orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const unsubscribe = OrderService.subscribeToRestaurantOrders(
      restaurantId,
      () => {
        loadOrders();
        if (onStatsChange) onStatsChange();
      }
    );

    return () => {
      unsubscribe();
    };
  }, [restaurantId]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const targetOrder = orders.find((o) => o.id === orderId);
      const updated = await OrderService.updateOrderStatus(orderId, newStatus, restaurantId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o))
      );
      if (onStatsChange) onStatsChange();

      if (newStatus === 'preparing') {
        toast.info('Prep Started 🍳', `${targetOrder?.table_number || 'Order'} in kitchen production`);
      } else if (newStatus === 'ready') {
        toast.success('Ready for Service 🛎️', `${targetOrder?.table_number || 'Order'} plated and ready`);
      } else if (newStatus === 'completed') {
        toast.success('Order Fulfilled ✅', `${targetOrder?.table_number || 'Order'} served to table`);
      } else if (newStatus === 'cancelled') {
        toast.warning('Order Cancelled', `${targetOrder?.table_number || 'Order'} ticket voided`);
      }
    } catch (err: any) {
      console.error('Failed to update order status:', err);
      toast.error('Failed to update status', err?.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === 'all' || order.status === statusFilter;
      const matchesSearch =
        !searchQuery ||
        order.table_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      preparing: orders.filter((o) => o.status === 'preparing').length,
      ready: orders.filter((o) => o.status === 'ready').length,
      completed: orders.filter((o) => o.status === 'completed').length,
    };
  }, [orders]);

  const getTimeElapsed = (createdDate: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(createdDate).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6e2da]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#1b3b2f] tracking-tight">
              Kitchen Display System (KDS)
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eef4f0] text-[#1b3b2f] border border-[#d2ded6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3a7d5c] animate-pulse" />
              HOT LINE LIVE
            </span>
          </div>
          <p className="text-xs lg:text-[13px] text-[#556960] mt-1 font-sans">
            Real-time live ticket dispatch, preparation stages, and culinary order fulfillment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#85988e] pointer-events-none" />
            <input
              type="text"
              placeholder="Search table or ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] placeholder-[#85988e] focus:outline-none focus:ring-2 focus:ring-[#3a7d5c] shadow-2xs"
            />
          </div>

          <button
            onClick={loadOrders}
            className="p-2.5 rounded-2xl bg-white border border-[#e6e2da] hover:bg-[#faf8f5] text-[#556960] shadow-2xs transition-colors"
            title="Refresh Orders"
            type="button"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#f4f1eb] text-xs font-semibold text-[#556960] overflow-x-auto">
        {[
          { id: 'all', label: 'All Tickets', count: counts.all },
          { id: 'pending', label: 'Unaccepted', count: counts.pending, alert: counts.pending > 0 },
          { id: 'preparing', label: 'In Production', count: counts.preparing },
          { id: 'ready', label: 'Plated & Ready', count: counts.ready },
          { id: 'completed', label: 'Fulfilled', count: counts.completed },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              statusFilter === tab.id
                ? 'bg-[#1b3b2f] text-white font-bold shadow-xs'
                : 'hover:text-[#1b3b2f] hover:bg-white/60'
            }`}
            type="button"
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                statusFilter === tab.id
                  ? 'bg-[#3a7d5c] text-white'
                  : tab.alert
                  ? 'bg-[#fdf8ee] text-[#b8782a] border border-[#fae2be]'
                  : 'bg-[#e6e2da] text-[#556960]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tickets Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white/90 rounded-3xl p-12 text-center border border-[#e6e2da] shadow-2xs space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#eef4f0] text-[#1b3b2f] flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-[#3a7d5c]" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#1b3b2f]">Kitchen Line is All Clear</h3>
          <p className="text-xs text-[#556960] max-w-sm mx-auto">
            No active tickets found under this status filter. New guest QR orders will automatically alert here with real-time sound.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const isPending = order.status === 'pending';
            const isPreparing = order.status === 'preparing';
            const isReady = order.status === 'ready';
            const isCompleted = order.status === 'completed';

            const statusColors = isPending
              ? 'border-[#fae2be] bg-[#fffdf9]'
              : isPreparing
              ? 'border-[#cbe0d3] bg-[#fbfdfc]'
              : isReady
              ? 'border-[#bfe0cd] bg-[#f3f9f5]'
              : 'border-[#e6e2da] bg-white/80 opacity-75';

            return (
              <div
                key={order.id}
                className={`rounded-3xl border shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between overflow-hidden ${statusColors}`}
              >
                <div>
                  {/* Top Bar of Ticket */}
                  <div className="p-4 border-b border-[#f0ede6] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-lg text-[#1b3b2f]">
                          {order.table_number || 'Takeaway'}
                        </span>
                        <span className="text-[10px] font-mono text-[#85988e]">
                          #{order.id.slice(0, 6)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-[#556960] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#85988e]" />
                          {getTimeElapsed(order.created_at)}
                        </span>
                        <span className="text-[#dcd7ce]">&bull;</span>
                        <span className="text-[10px] text-[#556960] capitalize">
                          {(order as any).order_type || 'dine-in'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedOrderForPrint(order)}
                        className="p-1.5 rounded-xl hover:bg-[#eef4f0] text-[#556960] hover:text-[#1b3b2f] transition-colors"
                        title="Print KOT Ticket"
                        type="button"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                          isPending
                            ? 'bg-[#fdf8ee] text-[#b8782a] border-[#fae2be]'
                            : isPreparing
                            ? 'bg-[#eef4f0] text-[#1b3b2f] border-[#cbe0d3]'
                            : isReady
                            ? 'bg-[#e0f0e6] text-[#25633e] border-[#bfe0cd]'
                            : 'bg-[#f4f1eb] text-[#85988e] border-[#e6e2da]'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="p-4 space-y-2.5">
                    {((order.items || (order as any).order_items || []) as any[])?.map((item: any) => (
                      <div key={item.id} className="flex items-start justify-between gap-2 text-xs">
                        <div className="flex items-start gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-lg bg-[#eef4f0] text-[#1b3b2f] font-bold text-[11px] flex items-center justify-center shrink-0 border border-[#d2ded6]">
                            {item.quantity}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#162820] leading-snug">
                              {item.menu_item?.name || 'Dish Item'}
                            </p>
                            {item.notes && (
                              <p className="text-[10px] text-[#b8782a] italic mt-0.5">
                                Note: &quot;{item.notes}&quot;
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="font-sans font-medium text-[#556960] shrink-0">
                          {formatCurrency(Number(item.price) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Ticket Actions */}
                <div className="p-4 pt-3 border-t border-[#f0ede6] bg-[#faf8f5]/60 flex items-center justify-between gap-2">
                  <div className="text-xs">
                    <span className="text-[10px] text-[#85988e] block">Ticket Total</span>
                    <span className="font-serif font-bold text-[#1b3b2f]">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isPending && (
                      <Button
                        size="sm"
                        disabled={updatingOrderId === order.id}
                        onClick={() => handleUpdateStatus(order.id, 'preparing')}
                        className="bg-[#1b3b2f] hover:bg-[#122820] text-white rounded-2xl text-xs font-semibold px-3 py-1.5 shadow-2xs"
                      >
                        Accept &amp; Cook
                      </Button>
                    )}

                    {isPreparing && (
                      <Button
                        size="sm"
                        disabled={updatingOrderId === order.id}
                        onClick={() => handleUpdateStatus(order.id, 'ready')}
                        className="bg-[#3a7d5c] hover:bg-[#2e6549] text-white rounded-2xl text-xs font-semibold px-3 py-1.5 shadow-2xs flex items-center gap-1"
                      >
                        <Bell className="w-3 h-3" />
                        <span>Plate Ready</span>
                      </Button>
                    )}

                    {isReady && (
                      <Button
                        size="sm"
                        disabled={updatingOrderId === order.id}
                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                        className="bg-[#1b3b2f] hover:bg-[#122820] text-white rounded-2xl text-xs font-semibold px-3 py-1.5 shadow-2xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Fulfill &amp; Clear</span>
                      </Button>
                    )}

                    {!isCompleted && order.status !== 'cancelled' && (
                      <button
                        disabled={updatingOrderId === order.id}
                        onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                        className="p-1.5 text-[#85988e] hover:text-[#b84232] rounded-xl hover:bg-rose-50 transition-colors"
                        title="Void Order"
                        type="button"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Print KOT Modal */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-[#faf8f5] rounded-4xl p-6 max-w-sm w-full border border-[#e6e2da] shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6e2da]">
              <div>
                <h3 className="text-base font-serif font-bold text-[#1b3b2f]">Kitchen Order Ticket (KOT)</h3>
                <p className="text-[11px] text-[#556960]">Thermal Receipt Preview</p>
              </div>
              <button
                onClick={() => setSelectedOrderForPrint(null)}
                className="w-7 h-7 rounded-full bg-white text-[#556960] hover:text-[#1b3b2f] flex items-center justify-center border border-[#e6e2da]"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 p-4 bg-white rounded-2xl border border-[#e6e2da] font-mono text-xs space-y-3">
              <div className="text-center border-b border-dashed border-[#e6e2da] pb-3">
                <p className="font-bold text-sm text-[#1b3b2f]">SERVEOS KITCHEN</p>
                <p className="text-[11px] text-[#85988e]">{new Date().toLocaleString()}</p>
                <p className="text-base font-bold text-[#1b3b2f] mt-1">
                  TABLE: {selectedOrderForPrint.table_number}
                </p>
              </div>

              <div className="space-y-1.5 py-2">
                {((selectedOrderForPrint.items || (selectedOrderForPrint as any).order_items || []) as any[])?.map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.quantity}x {item.menu_item?.name}</span>
                    <span>{formatCurrency(Number(item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-[#e6e2da] pt-3 flex justify-between font-bold text-sm">
                <span>TOTAL</span>
                <span>{formatCurrency(selectedOrderForPrint.total_amount)}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                className="w-1/2 rounded-2xl text-xs"
                onClick={() => setSelectedOrderForPrint(null)}
              >
                Close
              </Button>
              <Button
                className="w-1/2 rounded-2xl text-xs bg-[#1b3b2f] text-white hover:bg-[#122820] flex items-center justify-center gap-1.5"
                onClick={() => {
                  window.print();
                  setSelectedOrderForPrint(null);
                }}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Ticket</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
