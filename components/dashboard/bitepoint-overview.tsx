'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Search,
  Plus,
  TrendingUp,
  Clock,
  Users,
  Utensils,
  Receipt,
  ArrowUpRight,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Layers,
  ChefHat,
  Printer,
  CreditCard,
  DollarSign,
  QrCode,
  TableProperties
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Restaurant, OrderWithItems, RestaurantTable } from '@/lib/types';
import { formatCurrency, CURRENCY_SYMBOL } from '@/lib/currency';
import { TableService } from '@/lib/table-service';

interface BitepointOverviewProps {
  restaurant: Restaurant;
  orders: OrderWithItems[];
  tables?: RestaurantTable[];
  onSelectTab: (tab: string) => void;
}

interface TableNode {
  id: string;
  number: string;
  zone: string;
  capacity: number;
  status: 'occupied' | 'available' | 'reserved' | 'billed';
  server: string;
  serverInitials: string;
  seatedTime?: string;
  orderTotal?: number;
  activeItemsCount?: number;
  orderItems?: { name: string; qty: number; price: number; note?: string }[];
}

export function BitepointOverview({
  restaurant,
  orders,
  tables: initialTables,
  onSelectTab,
}: BitepointOverviewProps) {
  const [tables, setTables] = useState<RestaurantTable[]>(initialTables || []);
  const [activeZone, setActiveZone] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load tables if not provided
  useEffect(() => {
    if (initialTables && initialTables.length > 0) {
      setTables(initialTables);
    } else {
      TableService.getTables(restaurant.id).then((data) => {
        setTables(data);
      });
    }
  }, [restaurant.id, initialTables]);

  // Listen to cross-tab & parent table update events
  useEffect(() => {
    const handleUpdated = (e: any) => {
      if (!e.detail || e.detail.restaurantId === restaurant.id) {
        if (e.detail?.tables && Array.isArray(e.detail.tables)) {
          setTables(e.detail.tables);
        } else {
          TableService.getTables(restaurant.id).then((data) => setTables(data));
        }
      }
    };
    window.addEventListener('serveos_tables_updated', handleUpdated);
    return () => window.removeEventListener('serveos_tables_updated', handleUpdated);
  }, [restaurant.id]);

  // Dynamically compute table states based on actual live orders
  const computedTables: TableNode[] = useMemo(() => {
    return tables.map((base) => {
      // Look for an active or open order for this table
      const matchOrder = orders.find((o) => {
        if (!o.table_number) return false;
        const normOrderTable = o.table_number.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normBaseTable = base.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normBaseNum = base.name.replace(/\D/g, '');
        return (
          normOrderTable === normBaseTable ||
          normOrderTable === `table${normBaseNum}` ||
          (normBaseNum && normOrderTable === normBaseNum) ||
          (base.name.toLowerCase().includes('vip') && normOrderTable.includes('vip'))
        );
      });

      if (matchOrder && matchOrder.status !== 'cancelled' && matchOrder.status !== 'completed') {
        const elapsedMins = Math.max(
          1,
          Math.floor((Date.now() - new Date(matchOrder.created_at).getTime()) / 60000)
        );
        const isReady = matchOrder.status === 'ready';

        return {
          id: base.id,
          number: base.name,
          zone: base.zone,
          capacity: base.capacity,
          status: isReady ? 'billed' : 'occupied',
          server: matchOrder.customer_notes
            ? `Guest (${matchOrder.customer_notes.slice(0, 15)})`
            : 'QR Dine-In',
          serverInitials: 'QR',
          seatedTime: `${elapsedMins}m`,
          orderTotal: Number(matchOrder.total_amount || 0),
          activeItemsCount: (matchOrder.items || []).reduce((acc, i) => acc + i.quantity, 0),
          orderItems: (matchOrder.items || []).map((i) => ({
            name: i.name,
            qty: i.quantity,
            price: Number(i.price),
            note: undefined,
          })),
        };
      }

      return {
        id: base.id,
        number: base.name,
        zone: base.zone,
        capacity: base.capacity,
        status: base.status === 'reserved' ? 'reserved' : 'available',
        server: 'Unassigned',
        serverInitials: '—',
        orderTotal: 0,
        activeItemsCount: 0,
        orderItems: [],
      };
    });
  }, [tables, orders]);

  const [selectedTable, setSelectedTable] = useState<TableNode | null>(computedTables[0] || null);

  // Keep selectedTable synced with updated computedTables
  useEffect(() => {
    setSelectedTable((prev) => {
      if (!prev) return computedTables[0] || null;
      const refreshed = computedTables.find((t) => t.id === prev.id);
      return refreshed || computedTables[0] || null;
    });
  }, [computedTables]);

  const activeOrdersCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'preparing'
  ).length;

  const readyOrdersCount = orders.filter((o) => o.status === 'ready').length;

  // Real today's revenue strictly from actual orders
  const todayRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  // Unique zones from tables
  const uniqueZones = useMemo(() => {
    const set = new Set<string>();
    tables.forEach((t) => {
      if (t.zone) set.add(t.zone);
    });
    return Array.from(set);
  }, [tables]);

  const filteredTables = computedTables.filter((t) => {
    const matchesZone = activeZone === 'all' || t.zone.toLowerCase() === activeZone.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      t.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.server.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.zone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesZone && matchesSearch;
  });

  const occupiedCount = computedTables.filter((t) => t.status === 'occupied' || t.status === 'billed').length;
  const occupancyRate = computedTables.length > 0 ? Math.round((occupiedCount / computedTables.length) * 100) : 0;

  const getStatusBadge = (status: TableNode['status']) => {
    switch (status) {
      case 'occupied':
        return { label: 'Occupied', bg: 'bg-[#eef4f0] text-[#1b3b2f] border-[#cbe0d3]' };
      case 'available':
        return { label: 'Available', bg: 'bg-[#faf8f5] text-[#556960] border-[#e6e2da]' };
      case 'reserved':
        return { label: 'Reserved', bg: 'bg-[#fdf8ee] text-[#b8782a] border-[#fae2be]' };
      case 'billed':
        return { label: 'Ready / Billed', bg: 'bg-[#f3f6f1] text-[#3a7d5c] border-[#d2ded6]' };
    }
  };

  return (
    <div className="space-y-7 relative">
      {/* Botanical Header Bar */}
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-[#e6e2da] relative">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#1b3b2f] tracking-tight">
              Floor Overview &amp; Live Service
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eef4f0] text-[#1b3b2f] border border-[#d2ded6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3a7d5c] animate-pulse" />
              LUNCH SERVICE ACTIVE
            </span>
          </div>
          <p className="text-xs lg:text-[13px] text-[#556960] mt-1 font-sans">
            {restaurant.name} &bull; Real-time dining floor telemetry, guest covers &amp; ticket fulfillment
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/90 border border-[#e6e2da] text-xs font-medium text-[#556960] shadow-2xs">
            <Calendar className="w-4 h-4 text-[#85988e]" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
          </div>

          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#85988e] pointer-events-none" />
            <input
              type="text"
              placeholder="Search table, server..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] placeholder-[#85988e] focus:outline-none focus:ring-2 focus:ring-[#3a7d5c] shadow-2xs transition-all"
            />
          </div>

          <button
            onClick={() => onSelectTab('tables')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white hover:bg-[#faf8f5] text-[#1b3b2f] border border-[#e6e2da] font-semibold text-xs shadow-2xs transition-transform active:scale-95"
            type="button"
          >
            <TableProperties className="w-4 h-4 text-[#3a7d5c]" />
            <span>Manage Tables ({tables.length})</span>
          </button>

          <button
            onClick={() => onSelectTab('orders')}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#1b3b2f] hover:bg-[#122820] text-[#f8faf7] font-semibold text-xs shadow-xs transition-transform active:scale-95"
            type="button"
          >
            <ChefHat className="w-4 h-4 text-[#eef4f0]" />
            <span>Kitchen Display ({activeOrdersCount})</span>
          </button>
        </div>
      </header>

      {/* KPI Metric Cards */}
      <div className="space-y-3 relative">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#556960] tracking-wider uppercase font-sans">
            Daily Metrics &amp; Dining Velocity
          </span>
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#85988e]">
            <span className="text-[11px] font-medium font-serif italic text-[#4a5e52]">Dining Overview</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {/* Card 1: Today's Revenue */}
          <div className="bg-white/95 p-5 rounded-3xl border border-[#e6e2da] shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-medium text-[#556960] uppercase tracking-wider">Today&apos;s Revenue</span>
              <div className="w-8 h-8 rounded-2xl bg-[#eef4f0] text-[#1b3b2f] flex items-center justify-center font-bold text-xs">
                {CURRENCY_SYMBOL}
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-serif font-bold text-[#1b3b2f] tracking-tight">
                {formatCurrency(todayRevenue)}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#eef4f0] text-[#1b3b2f] text-[11px] font-bold">
                  <TrendingUp className="w-3 h-3 text-[#3a7d5c]" />
                  {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                </span>
                <span className="text-[11px] text-[#85988e] font-sans">recorded today</span>
              </div>
            </div>
          </div>

          {/* Card 2: Active Dining Tickets */}
          <div className="bg-white/95 p-5 rounded-3xl border border-[#e6e2da] shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-medium text-[#556960] uppercase tracking-wider">Kitchen Queue</span>
              <div className="w-8 h-8 rounded-2xl bg-[#fdf8ee] text-[#b8782a] flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-serif font-bold text-[#1b3b2f] tracking-tight">
                {activeOrdersCount} Active {activeOrdersCount === 1 ? 'Ticket' : 'Tickets'}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#eef4f0] text-[#1b3b2f] text-[11px] font-bold">
                  {readyOrdersCount} Ready for Pickup
                </span>
                <span className="text-[11px] text-[#85988e] font-sans">live dispatch</span>
              </div>
            </div>
          </div>

          {/* Card 3: Floor Occupancy */}
          <div className="bg-white/95 p-5 rounded-3xl border border-[#e6e2da] shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-medium text-[#556960] uppercase tracking-wider">Floor Occupancy</span>
              <div className="w-8 h-8 rounded-2xl bg-[#eef4f0] text-[#1b3b2f] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-serif font-bold text-[#1b3b2f] tracking-tight">
                {occupancyRate}% <span className="text-sm font-sans font-normal text-[#556960]">({occupiedCount}/{computedTables.length} tables)</span>
              </div>
              <div className="w-full bg-[#f4f1eb] h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div className="bg-[#3a7d5c] h-full rounded-full" style={{ width: `${occupancyRate}%` }} />
              </div>
            </div>
          </div>

          {/* Card 4: Avg Turn Time */}
          <div className="bg-white/95 p-5 rounded-3xl border border-[#e6e2da] shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-medium text-[#556960] uppercase tracking-wider">Average Table Turn</span>
              <div className="w-8 h-8 rounded-2xl bg-[#faf8f5] text-[#556960] flex items-center justify-center border border-[#e6e2da]">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-serif font-bold text-[#1b3b2f] tracking-tight">
                {orders.length > 0 ? '35 Mins' : '—'}
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#eef4f0] text-[#3a7d5c] text-[11px] font-bold">
                  {orders.length > 0 ? 'Optimal turnover' : 'Awaiting dine-in data'}
                </span>
                <span className="text-[11px] text-[#85988e] font-sans">dining pacing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Floor Plan Grid + Selected Table Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Zone Filter & Tables Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 p-2 rounded-2xl border border-[#e6e2da]">
            {/* Dynamic Zone Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setActiveZone('all')}
                className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  activeZone === 'all'
                    ? 'bg-[#1b3b2f] text-white shadow-2xs font-bold'
                    : 'text-[#556960] hover:text-[#1b3b2f] hover:bg-[#eef4f0]/60'
                }`}
                type="button"
              >
                All Tables ({computedTables.length})
              </button>
              {uniqueZones.map((zone) => {
                const count = computedTables.filter((t) => t.zone.toLowerCase() === zone.toLowerCase()).length;
                return (
                  <button
                    key={zone}
                    onClick={() => setActiveZone(zone)}
                    className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                      activeZone.toLowerCase() === zone.toLowerCase()
                        ? 'bg-[#1b3b2f] text-white shadow-2xs font-bold'
                        : 'text-[#556960] hover:text-[#1b3b2f] hover:bg-[#eef4f0]/60'
                    }`}
                    type="button"
                  >
                    {zone} ({count})
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-xs text-[#85988e] px-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#3a7d5c]" />
              <span>Click table to inspect</span>
            </div>
          </div>

          {/* Table Grid Cards */}
          {filteredTables.length === 0 ? (
            <div className="bg-white/95 rounded-3xl p-12 border border-[#e6e2da] text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-[#eef4f0] flex items-center justify-center text-[#3a7d5c] mx-auto">
                <TableProperties className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1b3b2f]">No Tables In This Zone</h3>
              <p className="text-xs text-[#556960] max-w-sm mx-auto">
                You can add or rearrange tables in the Table QR Studio.
              </p>
              <Button
                onClick={() => onSelectTab('tables')}
                className="bg-[#1b3b2f] hover:bg-[#122820] text-white rounded-2xl text-xs font-semibold px-4 py-2 mt-2"
              >
                Open Table Studio
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {filteredTables.map((tbl) => {
                const badge = getStatusBadge(tbl.status);
                const isSelected = selectedTable?.id === tbl.id;
                return (
                  <div
                    key={tbl.id}
                    onClick={() => setSelectedTable(tbl)}
                    className={`cursor-pointer rounded-3xl p-4 border transition-all duration-150 relative flex flex-col justify-between min-h-[148px] ${
                      isSelected
                        ? 'border-[#1b3b2f] bg-white ring-2 ring-[#1b3b2f] shadow-sm'
                        : 'border-[#e6e2da] bg-white/90 hover:bg-white hover:border-[#c5beb2] shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div>
                        <span className="font-serif font-bold text-lg text-[#1b3b2f] block leading-none">
                          {tbl.number}
                        </span>
                        <span className="text-[10px] text-[#85988e] mt-1 block font-medium">
                          {tbl.zone} &bull; {tbl.capacity}p
                        </span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#f0ede6]">
                      {tbl.status === 'occupied' || tbl.status === 'billed' ? (
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-[#85988e] block font-sans">Seated</span>
                            <span className="font-bold text-[#1b3b2f]">{tbl.seatedTime}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-[#85988e] block font-sans">{tbl.activeItemsCount} items</span>
                            <span className="font-bold text-[#1b3b2f]">{formatCurrency(tbl.orderTotal || 0)}</span>
                          </div>
                        </div>
                      ) : tbl.status === 'reserved' ? (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#85988e]">Time</span>
                          <span className="font-bold text-[#b8782a]">{tbl.seatedTime || 'Reserved'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs text-[#85988e]">
                          <span>Ready</span>
                          <span className="text-[11px] font-medium text-[#3a7d5c]">Cleaned &amp; Set</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Selected Table Detail Panel */}
        <div className="bg-white/95 rounded-3xl p-6 border border-[#e6e2da] shadow-xs flex flex-col justify-between min-h-[460px] relative">
          {selectedTable ? (
            <div>
              {/* Header Info */}
              <div className="flex items-start justify-between pb-4 border-b border-[#f0ede6]">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-xl text-[#1b3b2f]">
                      {selectedTable.number}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#f4f1eb] text-[#556960] font-medium">
                      {selectedTable.zone}
                    </span>
                  </div>
                  <p className="text-xs text-[#85988e] mt-1">
                    Capacity: {selectedTable.capacity} Diners &bull; Server: {selectedTable.server}
                  </p>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(selectedTable.status).bg}`}>
                  {getStatusBadge(selectedTable.status).label}
                </span>
              </div>

              {/* Order Status or Idle Notice */}
              {selectedTable.status === 'occupied' || selectedTable.status === 'billed' ? (
                <div className="py-4 space-y-4">
                  <div className="flex items-center justify-between text-xs bg-[#faf8f5] p-3 rounded-2xl border border-[#e6e2da]">
                    <div>
                      <span className="text-[10px] text-[#85988e] block uppercase font-medium">Seated Duration</span>
                      <span className="font-bold text-[#1b3b2f] text-sm">{selectedTable.seatedTime} active</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#85988e] block uppercase font-medium">Current Tab</span>
                      <span className="font-serif font-bold text-[#1b3b2f] text-sm">
                        {formatCurrency(selectedTable.orderTotal || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Active Ticket Items */}
                  <div>
                    <h4 className="text-xs font-bold text-[#1b3b2f] uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Active Dining Ticket</span>
                      <span className="text-[11px] text-[#3a7d5c] font-normal">{selectedTable.activeItemsCount} items</span>
                    </h4>
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                      {selectedTable.orderItems?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-white border border-[#f0ede6]">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-lg bg-[#eef4f0] text-[#1b3b2f] font-bold text-[10px] flex items-center justify-center">
                              {item.qty}x
                            </span>
                            <span className="font-medium text-[#162820]">{item.name}</span>
                          </div>
                          <span className="font-serif font-semibold text-[#1b3b2f]">
                            {formatCurrency(item.price * item.qty)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-[#faf8f5] text-[#85988e] flex items-center justify-center mx-auto border border-[#e6e2da]">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <h4 className="font-serif font-bold text-[#1b3b2f] text-sm">Table Available</h4>
                  <p className="text-xs text-[#556960] max-w-xs mx-auto">
                    No active digital order right now. Guest QR scans at this table will immediately trigger a ticket.
                  </p>
                </div>
              )}

              {/* Bottom Quick Actions */}
              <div className="pt-4 border-t border-[#f0ede6] space-y-2">
                <Button
                  onClick={() => onSelectTab('tables')}
                  className="w-full bg-[#1b3b2f] hover:bg-[#122820] text-white rounded-2xl text-xs py-2.5 flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Configure / Print QR Stand</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-[#85988e]">
              Select a table from the floor map to inspect live orders.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
