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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { OrderWithItems, OrderStatus } from '@/lib/types';
import { OrderService } from '@/lib/order-service';

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
        toast.info('Cooking Started 🍳', `${targetOrder?.table_number || 'Order'} in progress`);
      } else if (newStatus === 'ready') {
        toast.success('Marked Ready 🛎️', `${targetOrder?.table_number || 'Order'} ready for pickup`);
      } else if (newStatus === 'completed') {
        toast.success('Order Fulfilled ✅', `${targetOrder?.table_number || 'Order'} completed`);
      } else if (newStatus === 'cancelled') {
        toast.warning('Order Cancelled ✕', `${targetOrder?.table_number || 'Order'}`);
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
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((it) => it.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  const activeCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'preparing'
  ).length;

  const formatElapsed = (isoDate: string) => {
    const elapsedMs = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(elapsedMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m ago`;
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/70">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Orders Management &amp; KDS
            </h2>
            {activeCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#efa736]/20 text-[#825500] text-xs font-black border border-[#efa736]/40 animate-pulse">
                {activeCount} Active Tickets
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-0.5 font-medium">
            Real-time incoming dining tickets with table numbers, cooking notes, and 1-click status transitions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadOrders}
            className="text-xs gap-1.5 rounded-2xl bg-white shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Board</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {(['all', 'pending', 'preparing', 'ready', 'completed', 'cancelled'] as const).map((st) => {
            const count =
              st === 'all'
                ? orders.length
                : orders.filter((o) => o.status === st).length;

            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap capitalize transition-all flex items-center gap-1.5 shrink-0 ${
                  statusFilter === st
                    ? 'bg-stone-900 text-white shadow-sm font-bold'
                    : 'bg-white border border-stone-200/80 text-stone-600 hover:bg-stone-50'
                }`}
                type="button"
              >
                <span>{st === 'all' ? 'All Orders' : st}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === st
                    ? 'bg-stone-700 text-stone-100'
                    : 'bg-stone-100 text-stone-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by table or dish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#efa736] shadow-xs"
          />
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-[#eceae6] rounded-3xl p-12 text-center shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <ChefHat className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-stone-900">
            No Orders on Board
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {statusFilter !== 'all'
              ? `No orders currently matching status "${statusFilter}".`
              : 'When diners scan the table QR code and send orders, tickets will immediately appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const isUpdating = updatingOrderId === order.id;

            return (
              <div
                key={order.id}
                className={`bg-white border rounded-3xl p-5 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between space-y-4 relative overflow-hidden ${
                  order.status === 'pending'
                    ? 'border-[#efa736] ring-2 ring-[#efa736]/30'
                    : order.status === 'preparing'
                    ? 'border-blue-300'
                    : order.status === 'ready'
                    ? 'border-emerald-300'
                    : 'border-stone-200/80 opacity-80'
                }`}
              >
                <div>
                  {/* Ticket Header */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-stone-900 tabular-nums">
                          {order.table_number}
                        </span>
                        <Badge status={order.status} />
                      </div>
                      <span className="text-[11px] text-stone-400 font-mono mt-0.5 block">
                        #{order.id.slice(-6).toUpperCase()} &bull; {formatElapsed(order.created_at)}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedOrderForPrint(order)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Print Ticket"
                      type="button"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Line Items */}
                  <div className="py-3 space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs font-semibold"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-lg bg-stone-100 text-stone-800 font-black text-[11px] flex items-center justify-center shrink-0">
                            {item.quantity}x
                          </span>
                          <span className="text-stone-800 truncate">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-mono text-stone-500 shrink-0">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Customer Notes */}
                  {order.customer_notes && (
                    <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 leading-snug">
                      <span className="font-bold block">Chef Note:</span>
                      &ldquo;{order.customer_notes}&rdquo;
                    </div>
                  )}
                </div>

                {/* Ticket Footer Actions */}
                <div className="pt-3 border-t border-stone-100 space-y-2">
                  <div className="flex justify-between items-baseline text-xs font-semibold">
                    <span className="text-stone-500">Total Ticket</span>
                    <span className="text-sm font-black text-stone-900 font-mono">
                      ${Number(order.total_amount).toFixed(2)}
                    </span>
                  </div>

                  {/* 1-Click State Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {order.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                          className="text-[11px] text-red-600 hover:bg-red-50 rounded-xl"
                        >
                          Reject
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order.id, 'preparing')}
                          className="text-[11px] font-bold bg-[#efa736] hover:bg-[#e09827] text-stone-950 rounded-xl shadow-xs"
                        >
                          Accept &amp; Cook
                        </Button>
                      </>
                    )}

                    {order.status === 'preparing' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order.id, 'pending')}
                          className="text-[11px] rounded-xl"
                        >
                          Back
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order.id, 'ready')}
                          className="text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
                        >
                          Mark Ready 🛎️
                        </Button>
                      </>
                    )}

                    {order.status === 'ready' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order.id, 'preparing')}
                          className="text-[11px] rounded-xl"
                        >
                          Back
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order.id, 'completed')}
                          className="text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                        >
                          Complete &amp; Serve
                        </Button>
                      </>
                    )}

                    {(order.status === 'completed' || order.status === 'cancelled') && (
                      <div className="col-span-2 text-center py-1 text-[11px] text-stone-400 font-semibold capitalize">
                        Status: {order.status}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white text-stone-900 rounded-3xl p-6 max-w-sm w-full shadow-elevated border border-stone-300 font-mono text-xs space-y-4">
            <div className="text-center border-b pb-3 border-stone-200">
              <h3 className="text-base font-black uppercase tracking-wider">Kitchen Order Ticket</h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {selectedOrderForPrint.table_number.toUpperCase()} &bull; #{selectedOrderForPrint.id.slice(-6).toUpperCase()}
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">
                {new Date(selectedOrderForPrint.created_at).toLocaleString()}
              </p>
            </div>

            <div className="space-y-1.5 py-1">
              {selectedOrderForPrint.items.map((it) => (
                <div key={it.id} className="flex justify-between font-bold">
                  <span>{it.quantity}x {it.name}</span>
                  <span>${(Number(it.price) * it.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {selectedOrderForPrint.customer_notes && (
              <div className="p-2 bg-stone-100 rounded text-[11px] font-semibold border border-stone-200">
                NOTES: {selectedOrderForPrint.customer_notes}
              </div>
            )}

            <div className="pt-2 border-t border-stone-200 flex justify-between font-black text-sm">
              <span>TOTAL</span>
              <span>${Number(selectedOrderForPrint.total_amount).toFixed(2)}</span>
            </div>

            <div className="pt-2 flex gap-2 no-print">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrderForPrint(null)}
                className="flex-1 text-xs rounded-xl"
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                className="flex-1 text-xs font-bold rounded-xl bg-[#efa736] text-stone-950"
              >
                Print Ticket
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
