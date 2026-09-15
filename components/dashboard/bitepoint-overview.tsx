'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Search,
  Bell,
  SlidersHorizontal,
  Plus,
  TrendingUp,
  Clock,
  Users,
  Utensils,
  DollarSign,
  Receipt,
  ArrowUpRight,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Restaurant, OrderWithItems } from '@/lib/types';

interface BitepointOverviewProps {
  restaurant: Restaurant;
  orders: OrderWithItems[];
  onSelectTab: (tab: string) => void;
}

interface TableNode {
  id: string;
  number: string;
  zone: 'Main Dining' | 'Terrace' | 'Bar' | 'VIP';
  capacity: number;
  status: 'occupied' | 'available' | 'reserved' | 'billed';
  server: string;
  serverInitials: string;
  seatedTime?: string;
  orderTotal?: number;
  activeItemsCount?: number;
}

const INITIAL_TABLES: TableNode[] = [
  { id: 't1', number: 'T-01', zone: 'Main Dining', capacity: 4, status: 'occupied', server: 'Gladina S.', serverInitials: 'GS', seatedTime: '42m', orderTotal: 84.50, activeItemsCount: 3 },
  { id: 't2', number: 'T-02', zone: 'Main Dining', capacity: 2, status: 'available', server: 'Marco P.', serverInitials: 'MP' },
  { id: 't3', number: 'T-03', zone: 'Main Dining', capacity: 4, status: 'occupied', server: 'Gladina S.', serverInitials: 'GS', seatedTime: '18m', orderTotal: 46.00, activeItemsCount: 2 },
  { id: 't4', number: 'T-04', zone: 'Main Dining', capacity: 6, status: 'billed', server: 'Elena R.', serverInitials: 'ER', seatedTime: '1h 10m', orderTotal: 142.20, activeItemsCount: 5 },
  { id: 't5', number: 'T-05', zone: 'Main Dining', capacity: 2, status: 'reserved', server: 'Gladina S.', serverInitials: 'GS', seatedTime: '7:30 PM' },
  { id: 't6', number: 'T-06', zone: 'Main Dining', capacity: 4, status: 'available', server: 'Marco P.', serverInitials: 'MP' },
  { id: 'p1', number: 'P-01', zone: 'Terrace', capacity: 4, status: 'occupied', server: 'Elena R.', serverInitials: 'ER', seatedTime: '25m', orderTotal: 68.00, activeItemsCount: 4 },
  { id: 'p2', number: 'P-02', zone: 'Terrace', capacity: 4, status: 'occupied', server: 'Marco P.', serverInitials: 'MP', seatedTime: '34m', orderTotal: 92.50, activeItemsCount: 3 },
  { id: 'p3', number: 'P-03', zone: 'Terrace', capacity: 2, status: 'available', server: 'Elena R.', serverInitials: 'ER' },
  { id: 'b1', number: 'B-01', zone: 'Bar', capacity: 1, status: 'occupied', server: 'Gladina S.', serverInitials: 'GS', seatedTime: '12m', orderTotal: 18.00, activeItemsCount: 1 },
  { id: 'b2', number: 'B-02', zone: 'Bar', capacity: 1, status: 'available', server: 'Gladina S.', serverInitials: 'GS' },
  { id: 'v1', number: 'VIP-1', zone: 'VIP', capacity: 8, status: 'occupied', server: 'Gladina S.', serverInitials: 'GS', seatedTime: '55m', orderTotal: 215.00, activeItemsCount: 7 },
];

export function BitepointOverview({ restaurant, orders, onSelectTab }: BitepointOverviewProps) {
  const [activeZone, setActiveZone] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<TableNode | null>(INITIAL_TABLES[0]);

  const activeOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'preparing').length;
  const todayRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0) + 1280.50; // Mock cumulative base

  const filteredTables = INITIAL_TABLES.filter((t) => {
    const matchesZone = activeZone === 'all' || t.zone.toLowerCase() === activeZone.toLowerCase();
    const matchesSearch = !searchQuery || t.number.toLowerCase().includes(searchQuery.toLowerCase()) || t.server.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesZone && matchesSearch;
  });

  const occupiedCount = INITIAL_TABLES.filter((t) => t.status === 'occupied').length;
  const occupancyRate = Math.round((occupiedCount / INITIAL_TABLES.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2 border-b border-stone-200/70">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-stone-900 tracking-tight">
              Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              LIVE SERVICE
            </span>
          </div>
          <p className="text-xs lg:text-[13px] text-stone-500 mt-1 font-medium">
            {restaurant.name} <span className="mx-1">&bull;</span> Today&apos;s Operational Overview &amp; Live Floor Pulse
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-stone-200/80 text-xs font-medium text-stone-600 shadow-sm">
            <Calendar className="w-4 h-4 text-stone-400" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
          </div>

          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tables, orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-2xl border border-stone-200/80 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#efa736] shadow-sm transition-all"
            />
          </div>

          <button
            onClick={() => onSelectTab('orders')}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#efa736] hover:bg-[#e09827] text-stone-950 font-bold text-xs shadow-sm transition-transform active:scale-95"
            type="button"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Kitchen View ({activeOrdersCount})</span>
          </button>
        </div>
      </header>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-[#eceae6] shadow-card flex flex-col justify-between hover:shadow-elevated transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Today&apos;s Gross Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-[#efa736]/15 text-[#825500] flex items-center justify-center font-black">
              $
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-stone-900 tracking-tight tabular-nums">
              ${todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-[#109955] text-[11px] font-bold">
                <TrendingUp className="w-3 h-3" />
                +14.2%
              </span>
              <span className="text-[11px] text-stone-400 font-medium">vs yesterday</span>
            </div>
          </div>
        </div>

        {/* Active Dining Tickets */}
        <div className="bg-white p-5 rounded-2xl border border-[#eceae6] shadow-card flex flex-col justify-between hover:shadow-elevated transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Live Kitchen Tickets</span>
            <div className="w-8 h-8 rounded-xl bg-[#1f4e47]/10 text-[#1f4e47] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-stone-900 tracking-tight tabular-nums">
              {activeOrdersCount} Tickets
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50 text-[#d97706] text-[11px] font-bold">
                {orders.filter((o) => o.status === 'pending').length} Unaccepted
              </span>
              <span className="text-[11px] text-stone-400 font-medium">realtime dispatch</span>
            </div>
          </div>
        </div>

        {/* Floor Occupancy */}
        <div className="bg-white p-5 rounded-2xl border border-[#eceae6] shadow-card flex flex-col justify-between hover:shadow-elevated transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Dining Floor Pulse</span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-stone-900 tracking-tight tabular-nums">
              {occupancyRate}% Occupied
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-[#109955] text-[11px] font-bold">
                {occupiedCount} of {INITIAL_TABLES.length} Seated
              </span>
              <span className="text-[11px] text-stone-400 font-medium">turnover optimal</span>
            </div>
          </div>
        </div>

        {/* Average Dining Duration */}
        <div className="bg-white p-5 rounded-2xl border border-[#eceae6] shadow-card flex flex-col justify-between hover:shadow-elevated transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Avg Dining Duration</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-stone-900 tracking-tight tabular-nums">
              38m 20s
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs font-bold text-stone-900">4.8 / 5.0</span>
              <span className="text-[11px] text-stone-400 font-medium">guest satisfaction</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Floor Plan Grid & Table Inspect Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Floor Canvas (Left 8 Cols) */}
        <div className="xl:col-span-8 bg-white p-6 rounded-3xl border border-[#eceae6] shadow-card space-y-5">
          {/* Zone Filter Rail */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-stone-100 text-xs font-semibold text-stone-600">
              {(['all', 'Main Dining', 'Terrace', 'Bar', 'VIP'] as const).map((zone) => (
                <button
                  key={zone}
                  onClick={() => setActiveZone(zone)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    activeZone === zone
                      ? 'bg-stone-900 text-white shadow-xs font-bold'
                      : 'hover:text-stone-900 hover:bg-white/50'
                  }`}
                  type="button"
                >
                  {zone === 'all' ? 'All Zones' : zone}
                </button>
              ))}
            </div>

            {/* Status Legend */}
            <div className="flex items-center gap-3 text-[11px] font-medium text-stone-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#109955]" />
                Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#d97706]" />
                Occupied
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                Reserved
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#6d3bd7]" />
                Billed
              </span>
            </div>
          </div>

          {/* Tables Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {filteredTables.map((tbl) => {
              const isSelected = selectedTable?.id === tbl.id;

              return (
                <button
                  key={tbl.id}
                  onClick={() => setSelectedTable(tbl)}
                  className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between h-32 relative ${
                    isSelected
                      ? 'border-[#efa736] ring-2 ring-[#efa736]/30 bg-amber-50/40 shadow-sm'
                      : 'border-stone-200/80 hover:border-stone-300 bg-white hover:bg-stone-50/50'
                  }`}
                  type="button"
                >
                  {/* Table Card Top */}
                  <div className="flex items-start justify-between w-full">
                    <div>
                      <span className="text-base font-black text-stone-900 tracking-tight tabular-nums block">
                        {tbl.number}
                      </span>
                      <span className="text-[10px] text-stone-400 font-medium">
                        {tbl.capacity} seats &bull; {tbl.zone}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        tbl.status === 'available'
                          ? 'bg-[#e4f8ed] text-[#109955]'
                          : tbl.status === 'occupied'
                          ? 'bg-[#fff6e5] text-[#d97706]'
                          : tbl.status === 'reserved'
                          ? 'bg-[#eef4ff] text-[#3b82f6]'
                          : 'bg-[#f2edff] text-[#6d3bd7]'
                      }`}
                    >
                      {tbl.status}
                    </span>
                  </div>

                  {/* Table Card Bottom */}
                  <div className="w-full pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#1f4e47]/15 text-[#1f4e47] text-[10px] font-bold flex items-center justify-center">
                        {tbl.serverInitials}
                      </span>
                      <span className="text-[11px] text-stone-600 truncate max-w-[70px]">
                        {tbl.server.split(' ')[0]}
                      </span>
                    </div>

                    {tbl.seatedTime && (
                      <span className="text-[11px] font-bold text-stone-500 tabular-nums">
                        {tbl.seatedTime}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Table / Active Ticket Drawer (Right 4 Cols) */}
        <div className="xl:col-span-4 bg-white p-6 rounded-3xl border border-[#eceae6] shadow-card space-y-5">
          {selectedTable ? (
            <div>
              {/* Ticket Drawer Header */}
              <div className="flex items-start justify-between pb-4 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-stone-900 tracking-tight tabular-nums">
                      {selectedTable.number}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        selectedTable.status === 'available'
                          ? 'bg-[#e4f8ed] text-[#109955]'
                          : selectedTable.status === 'occupied'
                          ? 'bg-[#fff6e5] text-[#d97706]'
                          : selectedTable.status === 'reserved'
                          ? 'bg-[#eef4ff] text-[#3b82f6]'
                          : 'bg-[#f2edff] text-[#6d3bd7]'
                      }`}
                    >
                      {selectedTable.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 font-medium mt-0.5">
                    Zone: {selectedTable.zone} &bull; Capacity: {selectedTable.capacity} Guests
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-stone-400 font-medium block">Server</span>
                  <span className="text-xs font-bold text-stone-800">{selectedTable.server}</span>
                </div>
              </div>

              {/* Seated Ticket Details */}
              {selectedTable.status === 'occupied' || selectedTable.status === 'billed' ? (
                <div className="py-4 space-y-4">
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-500">Seated Duration</span>
                    <span className="font-bold text-stone-900 tabular-nums">{selectedTable.seatedTime} ago</span>
                  </div>

                  {/* Active Orders List */}
                  <div>
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2.5">
                      Active Ticket Line Items
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50/70 border border-stone-100">
                        <span className="font-semibold text-stone-800">2x Truffle Tagliatelle</span>
                        <span className="font-mono font-bold text-stone-900">$56.00</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50/70 border border-stone-100">
                        <span className="font-semibold text-stone-800">1x Margherita D.O.P.</span>
                        <span className="font-mono font-bold text-stone-900">$18.50</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50/70 border border-stone-100">
                        <span className="font-semibold text-stone-800">2x San Pellegrino Sparkling</span>
                        <span className="font-mono font-bold text-stone-900">$10.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Total Breakdown */}
                  <div className="pt-3 border-t border-stone-100 space-y-1.5 text-xs">
                    <div className="flex justify-between text-stone-500">
                      <span>Subtotal</span>
                      <span className="tabular-nums font-mono">${(Number(selectedTable.orderTotal || 84.50) * 0.9).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-500">
                      <span>Tax &amp; Service (10%)</span>
                      <span className="tabular-nums font-mono">${(Number(selectedTable.orderTotal || 84.50) * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-stone-900 pt-2 border-t border-stone-100">
                      <span>Total Amount</span>
                      <span className="tabular-nums font-mono text-base text-[#825500]">
                        ${Number(selectedTable.orderTotal || 84.50).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Ticket Action Buttons */}
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectTab('tables')}
                      className="text-xs rounded-xl"
                    >
                      View QR Code
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onSelectTab('orders')}
                      className="text-xs font-bold rounded-xl bg-[#efa736] hover:bg-[#e09827] text-stone-950"
                    >
                      Manage Order
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#109955] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-900">Table Ready for Guests</h4>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    Guests can scan the table QR code to place dining orders directly from their smartphone.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectTab('tables')}
                    className="text-xs rounded-xl gap-1.5"
                  >
                    <span>Open Table QR Studio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-stone-400 text-xs">
              Select a table node to inspect its live ticket
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
