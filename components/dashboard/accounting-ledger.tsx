'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Search,
  Download,
  Printer,
  FileText,
  TrendingUp,
  Receipt,
  ShoppingBag,
  CreditCard,
  PieChart,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  Layers,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Restaurant, OrderWithItems } from '@/lib/types';
import { formatCurrency, CURRENCY_SYMBOL } from '@/lib/currency';
import { BotanicalLeafBranch, HandwrittenNote } from '@/components/ui/botanical-decorations';

interface AccountingLedgerProps {
  restaurant: Restaurant;
  orders: OrderWithItems[];
}

interface TransactionItem {
  id: string;
  orderNumber: string;
  tableBadge: string;
  channel: 'Dine In' | 'Takeaway' | 'QR Dine-In';
  customer: string;
  server: string;
  timestamp: string;
  method: string;
  methodIcon: string;
  amount: number;
  status: 'Settled' | 'Processing';
}

export function AccountingLedger({ restaurant, orders }: AccountingLedgerProps) {
  const toast = useToast();
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);

  // Compute transactions dynamically from live orders
  const transactions: TransactionItem[] = React.useMemo(() => {
    return (orders || [])
      .filter((o) => o.status !== 'cancelled')
      .map((o) => {
        const orderDate = new Date(o.created_at);
        const isToday = new Date().toDateString() === orderDate.toDateString();
        const timeStr = orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const dateFormatted = isToday
          ? `Today, ${timeStr}`
          : `${orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeStr}`;

        const isSettled = o.status === 'completed' || o.status === 'ready';

        return {
          id: `#TX-${o.id.slice(0, 6).toUpperCase()}`,
          orderNumber: `#${o.id.slice(0, 4).toUpperCase()}`,
          tableBadge: o.table_number || 'Takeaway',
          channel: (o.table_number ? 'QR Dine-In' : 'Takeaway') as 'Dine In' | 'Takeaway' | 'QR Dine-In',
          customer: o.customer_notes || `Guest Diner (Table ${o.table_number || 'Takeaway'})`,
          server: 'Self QR Order',
          timestamp: dateFormatted,
          method: 'UPI / Digital QR',
          methodIcon: 'upi',
          amount: Number(o.total_amount || 0),
          status: isSettled ? 'Settled' : 'Processing',
        };
      });
  }, [orders]);

  const filteredTx = transactions.filter((tx) => {
    return (
      !searchQuery ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.tableBadge.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalAmount = filteredTx.reduce((sum, tx) => sum + tx.amount, 0);

  const handleExportCsv = () => {
    const headers = ['Tx ID', 'Order', 'Table', 'Channel', 'Customer', 'Server', 'Timestamp', 'Method', 'Amount (INR)', 'Status'];
    const rows = filteredTx.map((t) => [
      t.id,
      t.orderNumber,
      t.tableBadge,
      t.channel,
      t.customer,
      t.server,
      t.timestamp,
      t.method,
      t.amount.toFixed(2),
      t.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ServeOS-Ledger-${restaurant.slug}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Exported', 'Financial register downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6e2da]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#1b3b2f] tracking-tight">
              Accounting Register &amp; Ledger
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eef4f0] text-[#1b3b2f] border border-[#d2ded6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3a7d5c]" />
              GST 5% Reconciled
            </span>
          </div>
          <p className="text-xs lg:text-[13px] text-[#556960] mt-1 font-sans">
            Detailed sales auditing, QR payment settlements, server tips, and daily cash flow in INR
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleExportCsv}
            variant="outline"
            disabled={filteredTx.length === 0}
            className="flex items-center gap-1.5 rounded-2xl text-xs font-semibold px-4 py-2 border-[#dcd7ce] text-[#1b3b2f]"
          >
            <Download className="w-4 h-4 text-[#3a7d5c]" />
            <span>Export CSV</span>
          </Button>
        </div>
      </header>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/95 p-5 rounded-3xl border border-[#e6e2da] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#556960] uppercase">Settled Sales</span>
            <div className="w-8 h-8 rounded-2xl bg-[#eef4f0] text-[#1b3b2f] flex items-center justify-center font-bold text-xs">
              {CURRENCY_SYMBOL}
            </div>
          </div>
          <div className="mt-3 text-2xl font-serif font-bold text-[#1b3b2f]">
            {formatCurrency(totalAmount)}
          </div>
          <div className="text-[11px] text-[#3a7d5c] mt-1 font-medium">
            {filteredTx.length} {filteredTx.length === 1 ? 'transaction' : 'transactions'}
          </div>
        </div>

        <div className="bg-white/95 p-5 rounded-3xl border border-[#e6e2da] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#556960] uppercase">Average Ticket</span>
            <div className="w-8 h-8 rounded-2xl bg-[#fdf8ee] text-[#b8782a] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-serif font-bold text-[#1b3b2f]">
            {formatCurrency(filteredTx.length > 0 ? totalAmount / filteredTx.length : 0)}
          </div>
          <div className="text-[11px] text-[#85988e] mt-1">
            Across {filteredTx.length} completed {filteredTx.length === 1 ? 'order' : 'orders'}
          </div>
        </div>

        <div className="bg-white/95 p-5 rounded-3xl border border-[#e6e2da] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#556960] uppercase">Digital QR &amp; UPI</span>
            <div className="w-8 h-8 rounded-2xl bg-[#eef4f0] text-[#1b3b2f] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-serif font-bold text-[#1b3b2f]">
            {filteredTx.length > 0 ? '100%' : '0%'}
          </div>
          <div className="text-[11px] text-[#3a7d5c] mt-1 font-medium">
            Direct QR ordering flow
          </div>
        </div>

        <div className="bg-white/95 p-5 rounded-3xl border border-[#e6e2da] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#556960] uppercase">Tax Collected (GST)</span>
            <div className="w-8 h-8 rounded-2xl bg-[#faf8f5] text-[#556960] flex items-center justify-center border border-[#e6e2da]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-serif font-bold text-[#1b3b2f]">
            {formatCurrency(totalAmount * 0.05)}
          </div>
          <div className="text-[11px] text-[#85988e] mt-1">
            5% restaurant dining rate
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#f4f1eb] text-xs font-semibold text-[#556960]">
          {(['today', 'week', 'month'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3.5 py-1.5 rounded-xl capitalize transition-all ${
                timeframe === tf
                  ? 'bg-[#1b3b2f] text-white font-bold shadow-xs'
                  : 'hover:text-[#1b3b2f] hover:bg-white/60'
              }`}
              type="button"
            >
              {tf === 'today' ? 'Today' : tf === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#85988e] pointer-events-none" />
          <input
            type="text"
            placeholder="Search by ID, customer, order #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] placeholder-[#85988e] focus:outline-none focus:ring-2 focus:ring-[#3a7d5c] shadow-2xs"
          />
        </div>
      </div>

      {/* Transactions Register Table */}
      <div className="bg-white/95 rounded-3xl p-5 border border-[#e6e2da] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#f0ede6] text-[#85988e] font-medium">
                <th className="py-3 px-3">Transaction</th>
                <th className="py-3 px-3">Table / Channel</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Server</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ede6]">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-xs text-[#85988e]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#eef4f0] flex items-center justify-center text-[#3a7d5c]">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <p className="font-serif font-bold text-sm text-[#1b3b2f]">No Transactions Found</p>
                      <p className="max-w-xs text-[#556960]">
                        Settled dining and takeaway orders will automatically appear in this financial ledger.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#faf8f5] transition-colors">
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-[#1b3b2f] block">{tx.id}</span>
                      <span className="text-[10px] text-[#85988e]">Order {tx.orderNumber}</span>
                    </td>

                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 font-bold text-[#162820]">
                      {tx.tableBadge}
                    </span>
                    <span className="text-[10px] text-[#556960] block">{tx.channel}</span>
                  </td>

                  <td className="py-3.5 px-3 font-medium text-[#162820]">{tx.customer}</td>

                  <td className="py-3.5 px-3 text-[#556960]">{tx.server}</td>

                  <td className="py-3.5 px-3 text-[#85988e] font-sans">{tx.timestamp}</td>

                  <td className="py-3.5 px-3 text-[#162820] font-medium">{tx.method}</td>

                  <td className="py-3.5 px-3 font-serif font-bold text-[#1b3b2f] text-sm">
                    {formatCurrency(tx.amount)}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#eef4f0] text-[#1b3b2f] border border-[#d2ded6]">
                      <CheckCircle2 className="w-3 h-3 text-[#3a7d5c]" />
                      {tx.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="p-1.5 rounded-xl hover:bg-[#eef4f0] text-[#556960] hover:text-[#1b3b2f] transition-colors inline-flex items-center gap-1"
                      title="View Receipt Slip"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-semibold">Slip</span>
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-[#faf8f5] rounded-4xl p-6 max-w-sm w-full border border-[#e6e2da] shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6e2da]">
              <div>
                <h3 className="text-base font-serif font-bold text-[#1b3b2f]">Settlement Receipt</h3>
                <p className="text-[11px] text-[#556960]">{selectedTx.id}</p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="w-7 h-7 rounded-full bg-white text-[#556960] hover:text-[#1b3b2f] flex items-center justify-center border border-[#e6e2da]"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 p-4 bg-white rounded-2xl border border-[#e6e2da] font-mono text-xs space-y-3">
              <div className="text-center border-b border-dashed border-[#e6e2da] pb-3">
                <p className="font-bold text-sm text-[#1b3b2f]">{restaurant.name}</p>
                <p className="text-[10px] text-[#85988e]">{selectedTx.timestamp}</p>
                <p className="text-xs font-bold text-[#1b3b2f] mt-1">TABLE: {selectedTx.tableBadge}</p>
              </div>

              <div className="space-y-1 py-1 text-xs">
                <div className="flex justify-between text-[#556960]">
                  <span>Customer:</span>
                  <span className="font-medium text-[#162820]">{selectedTx.customer}</span>
                </div>
                <div className="flex justify-between text-[#556960]">
                  <span>Server:</span>
                  <span className="font-medium text-[#162820]">{selectedTx.server}</span>
                </div>
                <div className="flex justify-between text-[#556960]">
                  <span>Method:</span>
                  <span className="font-medium text-[#162820]">{selectedTx.method}</span>
                </div>
                <div className="flex justify-between text-[#556960]">
                  <span>Subtotal:</span>
                  <span className="font-medium text-[#162820]">{formatCurrency(selectedTx.amount * 0.95)}</span>
                </div>
                <div className="flex justify-between text-[#556960]">
                  <span>GST (5%):</span>
                  <span className="font-medium text-[#162820]">{formatCurrency(selectedTx.amount * 0.05)}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-[#e6e2da] pt-3 flex justify-between font-bold text-sm text-[#1b3b2f]">
                <span>TOTAL PAID</span>
                <span>{formatCurrency(selectedTx.amount)}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                className="w-1/2 rounded-2xl text-xs"
                onClick={() => setSelectedTx(null)}
              >
                Close
              </Button>
              <Button
                className="w-1/2 rounded-2xl text-xs bg-[#1b3b2f] text-white hover:bg-[#122820] flex items-center justify-center gap-1.5"
                onClick={() => {
                  window.print();
                  setSelectedTx(null);
                }}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
