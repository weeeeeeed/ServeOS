'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Search,
  Download,
  Printer,
  FileText,
  DollarSign,
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Restaurant, OrderWithItems } from '@/lib/types';

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

const SAMPLE_TRANSACTIONS: TransactionItem[] = [
  { id: '#TX-8821', orderNumber: '#925', tableBadge: 'A4', channel: 'Dine In', customer: 'Ariel Hikmat', server: 'Gladina S.', timestamp: 'Today, 06:12 PM', method: 'Apple Pay / QR', methodIcon: 'apple', amount: 87.34, status: 'Settled' },
  { id: '#TX-8820', orderNumber: '#921', tableBadge: 'B2', channel: 'Dine In', customer: 'Denis Freeman', server: 'Gladina S.', timestamp: 'Today, 06:18 PM', method: 'POS Terminal', methodIcon: 'pos', amount: 57.87, status: 'Processing' },
  { id: '#TX-8819', orderNumber: '#916', tableBadge: 'TA', channel: 'Takeaway', customer: 'Morgan Cox', server: 'Self Pick-up', timestamp: 'Today, 06:19 PM', method: 'Web Checkout', methodIcon: 'web', amount: 86.96, status: 'Settled' },
  { id: '#TX-8818', orderNumber: '#912', tableBadge: 'A9', channel: 'Dine In', customer: 'Maja Becker', server: 'Gladina S.', timestamp: 'Today, 05:32 PM', method: 'Mastercard', methodIcon: 'card', amount: 98.34, status: 'Settled' },
  { id: '#TX-8817', orderNumber: '#908', tableBadge: 'C2', channel: 'Dine In', customer: 'Erwan Richard', server: 'Gladina S.', timestamp: 'Today, 05:20 PM', method: 'Split Cash / Card', methodIcon: 'split', amount: 56.96, status: 'Settled' },
];

export function AccountingLedger({ restaurant, orders }: AccountingLedgerProps) {
  const toast = useToast();
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'custom'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<TransactionItem[]>(SAMPLE_TRANSACTIONS);

  const filteredTx = transactions.filter((tx) => {
    return (
      !searchQuery ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleExportCsv = () => {
    const headers = ['Tx ID', 'Order', 'Table', 'Channel', 'Customer', 'Server', 'Timestamp', 'Method', 'Amount', 'Status'];
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
    link.setAttribute('download', `BitePoint-Ledger-${restaurant.slug}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Exported', 'Financial ledger downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2 border-b border-stone-200/70">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl lg:text-3xl font-black text-stone-900 tracking-tight">
              Accounting &amp; Ledger
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#1f4e47]/10 text-[#1f4e47] text-[11px] font-bold tracking-wide uppercase">
              LIVE SYNC
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5 font-medium">
            {restaurant.name} &bull; Verified Ledger, Payment Distribution &amp; Turnout Analytics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-500 font-medium px-3.5 py-2 bg-white rounded-2xl border border-stone-200/80 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span>Wednesday, 12 July 2023</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="text-xs gap-1.5 rounded-2xl bg-white shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => toast.success('Batch Settle Initiated', 'All pending payouts compiled')}
            className="text-xs font-bold gap-1.5 rounded-2xl bg-[#efa736] hover:bg-[#e09827] text-stone-950 shadow-sm"
          >
            <span>Batch Settle</span>
          </Button>
        </div>
      </div>

      {/* Timeframe selector bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex bg-stone-100 p-1 rounded-2xl text-xs font-semibold text-stone-600">
          {(['today', 'week', 'month', 'custom'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-1.5 rounded-xl capitalize transition-all ${
                timeframe === tf
                  ? 'bg-stone-900 text-white font-bold shadow-xs'
                  : 'hover:text-stone-900 hover:bg-white/50'
              }`}
              type="button"
            >
              {tf === 'today' ? 'Today' : tf === 'week' ? 'This Week' : tf === 'month' ? 'This Month' : 'Custom'}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search transactions, orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-2xl border border-stone-200/80 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#efa736] shadow-sm transition-all"
          />
        </div>
      </div>

      {/* 4 Financial KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-[#eceae6] shadow-card flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Total Net Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-[#efa736]/15 text-[#825500] flex items-center justify-center font-black">
              $
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-stone-900 tracking-tight tabular-nums">
              $48,290<span className="text-stone-400 font-medium text-base">.50</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-[#109955] text-[11px] font-bold">
                <TrendingUp className="w-3 h-3" />
                +14.2%
              </span>
              <span className="text-[11px] text-stone-400 font-medium">vs last month</span>
            </div>
          </div>
        </div>

        {/* Orders Processed */}
        <div className="bg-white p-5 rounded-2xl border border-[#eceae6] shadow-card flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Orders Processed</span>
            <div className="w-8 h-8 rounded-xl bg-[#1f4e47]/10 text-[#1f4e47] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-stone-900 tracking-tight tabular-nums">
              1,482
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-[#109955] text-[11px] font-bold">
                <TrendingUp className="w-3 h-3" />
                +8.5%
              </span>
              <span className="text-[11px] text-stone-400 font-medium">98.4% completed</span>
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white p-5 rounded-2xl border border-[#eceae6] shadow-card flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Avg. Order Value</span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-stone-900 tracking-tight tabular-nums">
              $32<span className="text-stone-400 font-medium text-base">.58</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-[#109955] text-[11px] font-bold">
                <TrendingUp className="w-3 h-3" />
                +3.1%
              </span>
              <span className="text-[11px] text-stone-400 font-medium">+$0.98 ticket gain</span>
            </div>
          </div>
        </div>

        {/* Net Profit Margin */}
        <div className="bg-white p-5 rounded-2xl border border-[#eceae6] shadow-card flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Net Profit Margin</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-stone-900 tracking-tight tabular-nums">
              28.4%
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs font-bold text-stone-900">+$13,714.50</span>
              <span className="text-[11px] text-stone-400 font-medium">clean EBITDAR</span>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Multi-channel Revenue Breakdown Chart (Direct from Stitch Screen 4) */}
      <div className="bg-white p-6 rounded-3xl border border-[#eceae6] shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-900 tracking-tight">
              Revenue Breakdown &amp; Sales Trend
            </h3>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">
              Cash flow &amp; sales volume grouped across dining channels
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#efa736]" />
              <span className="text-stone-700">Dine-In Orders</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2f6858]" />
              <span className="text-stone-700">Online &amp; QR</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c7bfb4]" />
              <span className="text-stone-400">Takeaway</span>
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="w-full h-56 sm:h-64 relative overflow-hidden pt-2">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 900 240">
            <defs>
              <linearGradient id="chartDineIn" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#efa736" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#efa736" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="chartQR" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#2f6858" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#2f6858" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <line stroke="#f3f1ec" strokeDasharray="3 3" strokeWidth="1" x1="30" x2="870" y1="30" y2="30" />
            <line stroke="#f3f1ec" strokeDasharray="3 3" strokeWidth="1" x1="30" x2="870" y1="80" y2="80" />
            <line stroke="#f3f1ec" strokeDasharray="3 3" strokeWidth="1" x1="30" x2="870" y1="130" y2="130" />
            <line stroke="#f3f1ec" strokeDasharray="3 3" strokeWidth="1" x1="30" x2="870" y1="180" y2="180" />
            <line stroke="#eae6de" strokeWidth="1" x1="30" x2="870" y1="220" y2="220" />
            <line opacity="0.6" stroke="#efa736" strokeDasharray="4 4" strokeWidth="1.5" x1="670" x2="670" y1="25" y2="220" />

            {/* QR Polygons */}
            <polygon fill="url(#chartQR)" points="50,220 50,175 150,165 250,170 350,145 450,135 550,110 670,90 770,115 850,125 850,220" />
            <polyline fill="none" points="50,175 150,165 250,170 350,145 450,135 550,110 670,90 770,115 850,125" stroke="#2f6858" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />

            {/* Dine-In Polygons */}
            <polygon fill="url(#chartDineIn)" points="50,220 50,130 150,110 250,120 350,90 450,75 550,55 670,30 770,60 850,70 850,220" />
            <polyline fill="none" points="50,130 150,110 250,120 350,90 450,75 550,55 670,30 770,60 850,70" stroke="#efa736" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />

            {/* Takeaway Dashed Line */}
            <polyline fill="none" points="50,195 150,190 250,185 350,178 450,165 550,155 670,140 770,160 850,170" stroke="#c7bfb4" strokeDasharray="4 4" strokeLinecap="round" strokeWidth="2" />

            <circle cx="670" cy="30" fill="#ffffff" r="5" stroke="#efa736" strokeWidth="3" />
            <circle cx="670" cy="90" fill="#ffffff" r="4" stroke="#2f6858" strokeWidth="2" />
          </svg>

          {/* Peak Tooltip Callout */}
          <div className="absolute top-2 left-[70%] sm:left-[73%] -translate-x-1/2 bg-[#1b1c1a] text-white px-3 py-2 rounded-xl shadow-lg flex flex-col pointer-events-none text-xs">
            <div className="flex items-center justify-between gap-3 text-[10px] text-stone-400">
              <span>Saturday Peak</span>
              <span className="text-[#efa736] font-bold">08:00 PM</span>
            </div>
            <div className="font-bold text-sm text-white mt-0.5">$6,840.00</div>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-300">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#efa736]" />
                Dine: 74%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2f6858]" />
                QR: 26%
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-between px-6 text-stone-500 text-xs font-medium border-t border-stone-100 pt-2">
          <span>Mon, 06</span>
          <span>Tue, 07</span>
          <span>Wed, 08</span>
          <span>Thu, 09</span>
          <span>Fri, 10</span>
          <span className="text-[#825500] font-bold">Sat, 11 (Peak)</span>
          <span>Sun, 12 (Today)</span>
        </div>
      </div>

      {/* Payment Channels & Daily Peak Turnover Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Payment Channels */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#eceae6] shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900">Payment Channels</h3>
              <PieChart className="w-4 h-4 text-stone-400" />
            </div>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">
              Direct terminal vs digital frictionless settling
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-4">
            {/* SVG Donut */}
            <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" fill="none" r="14" stroke="#f4f2ec" strokeWidth="4" />
                <circle cx="18" cy="18" fill="none" r="14" stroke="#2f6858" strokeDasharray="51 100" strokeDashoffset="0" strokeLinecap="round" strokeWidth="4.2" />
                <circle cx="18" cy="18" fill="none" r="14" stroke="#efa736" strokeDasharray="28 100" strokeDashoffset="-52" strokeLinecap="round" strokeWidth="4.2" />
                <circle cx="18" cy="18" fill="none" r="14" stroke="#d6c4af" strokeDasharray="9 100" strokeDashoffset="-81" strokeLinecap="round" strokeWidth="4.2" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase font-bold text-stone-400">Total</span>
                <span className="text-sm font-black text-stone-900 leading-none mt-0.5">$48.3k</span>
              </div>
            </div>

            {/* Channels Legend */}
            <div className="flex flex-col gap-2.5 w-full sm:w-auto text-xs">
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2f6858]" />
                  <span className="font-medium text-stone-800">Contactless QR</span>
                </div>
                <span className="font-bold text-stone-900">58%</span>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#efa736]" />
                  <span className="font-medium text-stone-800">POS Terminal</span>
                </div>
                <span className="font-bold text-stone-900">32%</span>
              </div>
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d6c4af]" />
                  <span className="font-medium text-stone-800">Cash / Paper</span>
                </div>
                <span className="font-bold text-stone-900">10%</span>
              </div>
            </div>
          </div>

          <div className="bg-[#faf9f6] p-3 rounded-2xl border border-stone-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-stone-700">
              <CheckCircle2 className="w-4 h-4 text-[#2f6858]" />
              <span>Settlement fees: <strong className="font-bold text-stone-900">1.42% avg</strong></span>
            </div>
            <span className="text-[10px] font-bold text-[#2f6858] uppercase px-2 py-0.5 bg-emerald-50 rounded-full">
              Optimal
            </span>
          </div>
        </div>

        {/* Daily Peak Turnover Hours */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#eceae6] shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Daily Peak Turnover Hours</h3>
              <p className="text-xs text-stone-500 mt-0.5 font-medium">Shift distribution of order load across service hours</p>
            </div>
            <div className="flex items-center gap-1.5 bg-stone-100 px-2.5 py-1 rounded-full text-[11px] font-semibold text-stone-600">
              <span className="w-1.5 h-1.5 rounded-full bg-[#efa736]" />
              <span>11:00 AM - 10:00 PM</span>
            </div>
          </div>

          <div className="grid grid-cols-10 items-end gap-2 sm:gap-3 h-40 pt-4 pb-1 px-1">
            {[
              { label: '11a', height: '25%', active: false },
              { label: '12p', height: '55%', active: false },
              { label: '1p', height: '78%', active: true, val: '$2.1k' },
              { label: '2p', height: '40%', active: false },
              { label: '3p', height: '20%', active: false },
              { label: '5p', height: '35%', active: false },
              { label: '6p', height: '60%', active: false },
              { label: '7p', height: '85%', active: false },
              { label: '8p', height: '98%', active: true, val: '$3.4k' },
              { label: '9p', height: '48%', active: false },
            ].map((bar) => (
              <div key={bar.label} className="flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer">
                {bar.val && (
                  <span className="text-[10px] text-[#825500] font-bold">
                    {bar.val}
                  </span>
                )}
                <div
                  className={`w-full rounded-t transition-all ${
                    bar.active ? 'bg-[#efa736] shadow-xs' : 'bg-[#edebe4] group-hover:bg-[#efa736]/70'
                  }`}
                  style={{ height: bar.height }}
                />
                <span className={`text-[10px] ${bar.active ? 'font-black text-stone-900' : 'text-stone-400 font-medium'}`}>
                  {bar.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-500 font-medium">
            <span>Lunch Rush: <strong className="text-stone-900 font-bold">82% Occupied</strong></span>
            <span>Dinner Peak: <strong className="text-stone-900 font-bold">$3,420 / hr</strong></span>
          </div>
        </div>
      </div>

      {/* Settlement Register Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#eceae6] shadow-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-stone-100">
          <div>
            <h3 className="text-base font-bold text-stone-900">Settlement Register</h3>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">Verified receipts &amp; payments for current business cycle</p>
          </div>
          <div className="text-xs text-stone-400 font-medium">
            Showing {filteredTx.length} contemporary settlements
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf9f6] text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-200/70">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Tx ID</th>
                <th className="py-3 px-4">Order &amp; Origin</th>
                <th className="py-3 px-4">Customer / Server</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {filteredTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#faf9f6] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#825500] font-mono">{tx.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-[#1f4e47] text-white text-[10px] font-bold flex items-center justify-center">
                        {tx.tableBadge}
                      </span>
                      <span className="font-semibold text-stone-900">{tx.orderNumber}</span>
                      <span className="text-stone-400 text-[11px]">({tx.channel})</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-stone-900">{tx.customer}</span>
                      <span className="text-[11px] text-stone-400">{tx.server}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">{tx.timestamp}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-stone-700">
                      <CreditCard className="w-3.5 h-3.5 text-[#1f4e47]" />
                      <span>{tx.method}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-stone-900 font-mono">
                    +${tx.amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        tx.status === 'Settled'
                          ? 'bg-emerald-50 text-[#109955]'
                          : 'bg-amber-50 text-[#d97706]'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${tx.status === 'Settled' ? 'bg-[#109955]' : 'bg-[#d97706]'}`} />
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
