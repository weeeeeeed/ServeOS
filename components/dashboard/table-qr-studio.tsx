'use client';

import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Download,
  Printer,
  Copy,
  ExternalLink,
  Check,
  Search,
  Users,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Restaurant } from '@/lib/types';

interface TableQrStudioProps {
  restaurant: Restaurant;
}

interface StudioTable {
  id: string;
  tableNumber: string;
  zone: string;
  capacity: number;
  status: 'active' | 'in_service' | 'idle';
}

const DEFAULT_STUDIO_TABLES: StudioTable[] = [
  { id: '1', tableNumber: 'Table 1', zone: 'Main Dining', capacity: 4, status: 'in_service' },
  { id: '2', tableNumber: 'Table 2', zone: 'Main Dining', capacity: 2, status: 'active' },
  { id: '3', tableNumber: 'Table 3', zone: 'Main Dining', capacity: 4, status: 'in_service' },
  { id: '4', tableNumber: 'Table 4', zone: 'Main Dining', capacity: 6, status: 'active' },
  { id: '5', tableNumber: 'Table 5', zone: 'Main Dining', capacity: 2, status: 'idle' },
  { id: '6', tableNumber: 'Table 6', zone: 'Main Dining', capacity: 4, status: 'active' },
  { id: '7', tableNumber: 'Patio P-1', zone: 'Terrace Patio', capacity: 4, status: 'in_service' },
  { id: '8', tableNumber: 'Patio P-2', zone: 'Terrace Patio', capacity: 4, status: 'active' },
  { id: '9', tableNumber: 'Patio P-3', zone: 'Terrace Patio', capacity: 2, status: 'idle' },
  { id: '10', tableNumber: 'Bar B-1', zone: 'Cocktail Bar', capacity: 1, status: 'in_service' },
  { id: '11', tableNumber: 'Bar B-2', zone: 'Cocktail Bar', capacity: 1, status: 'active' },
  { id: '12', tableNumber: 'VIP Booth', zone: 'VIP Lounge', capacity: 8, status: 'in_service' },
];

export function TableQrStudio({ restaurant }: TableQrStudioProps) {
  const toast = useToast();
  const [activeZone, setActiveZone] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<StudioTable>(DEFAULT_STUDIO_TABLES[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const restaurantUrl = `${baseUrl}/r/${restaurant.slug}`;

  const filteredTables = DEFAULT_STUDIO_TABLES.filter((t) => {
    const matchesZone = activeZone === 'all' || t.zone.toLowerCase().includes(activeZone.toLowerCase());
    const matchesSearch = !searchQuery || t.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) || t.zone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesZone && matchesSearch;
  });

  const handleCopyLink = (tableNum: string, id: string) => {
    const tableUrl = `${restaurantUrl}?table=${encodeURIComponent(tableNum)}`;
    navigator.clipboard.writeText(tableUrl);
    setCopiedId(id);
    toast.success('Link Copied 📋', `Direct QR dining link for ${tableNum} copied`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadQr = (tableNum: string) => {
    const svgElement = document.getElementById(`qr-svg-${tableNum}`);
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 600;
    canvas.height = 600;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 50, 50, 500, 500);

        const a = document.createElement('a');
        a.download = `BitePoint-QR-${restaurant.slug}-${tableNum.replace(/\s+/g, '-').toLowerCase()}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
        toast.success('Downloaded PNG', `High-res QR for ${tableNum}`);
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/70">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              QR Studio &amp; Floor Tables
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#1f4e47]/10 text-[#1f4e47] text-xs font-bold">
              {DEFAULT_STUDIO_TABLES.length} Active Nodes
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5 font-medium">
            Generate high-resolution printable table QR codes mapped directly to diner self-ordering tables
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs gap-1.5 rounded-xl bg-white shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Tent Cards</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.open(restaurantUrl, '_blank')}
            className="text-xs font-bold gap-1.5 rounded-xl bg-[#efa736] hover:bg-[#e09827] text-stone-950 shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview Diner Menu</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Rail */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
              {zone === 'all' ? 'All Tables' : zone}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search table number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-2xl border border-stone-200/80 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#efa736] shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Main Grid: Tables List (Left 8) & QR Preview Canvas (Right 4) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Tables Matrix */}
        <div className="xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredTables.map((tbl) => {
            const isSelected = selectedTable.id === tbl.id;
            const tableUrl = `${restaurantUrl}?table=${encodeURIComponent(tbl.tableNumber)}`;

            return (
              <div
                key={tbl.id}
                onClick={() => setSelectedTable(tbl)}
                className={`p-5 rounded-3xl bg-white border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'border-[#efa736] ring-2 ring-[#efa736]/30 shadow-card bg-amber-50/20'
                    : 'border-stone-200/80 hover:border-stone-300 shadow-card hover:shadow-elevated'
                }`}
              >
                <div>
                  {/* Table Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-black text-stone-900 tracking-tight tabular-nums">
                        {tbl.tableNumber}
                      </h4>
                      <p className="text-[11px] text-stone-400 font-medium">
                        {tbl.zone} &bull; {tbl.capacity} seats
                      </p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        tbl.status === 'in_service'
                          ? 'bg-[#fff6e5] text-[#d97706]'
                          : tbl.status === 'active'
                          ? 'bg-[#e4f8ed] text-[#109955]'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {tbl.status === 'in_service' ? 'Occupied' : 'Ready'}
                    </span>
                  </div>

                  {/* Miniature QR */}
                  <div className="my-4 flex items-center justify-center p-3 bg-stone-50 rounded-2xl border border-stone-100">
                    <QRCodeSVG
                      id={`qr-svg-${tbl.tableNumber}`}
                      value={tableUrl}
                      size={100}
                      level="H"
                      includeMargin={false}
                      fgColor="#1c1917"
                      bgColor="transparent"
                    />
                  </div>
                </div>

                {/* Card Bottom Quick Actions */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1 text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyLink(tbl.tableNumber, tbl.id);
                    }}
                    className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition"
                    title="Copy Link"
                  >
                    {copiedId === tbl.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadQr(tbl.tableNumber);
                    }}
                    className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition"
                    title="Download PNG"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(tableUrl, '_blank');
                    }}
                    className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition"
                    title="Open Table Menu"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Table Full Inspector & Print Preview Canvas (Right 4) */}
        <div className="xl:col-span-4 bg-white p-6 rounded-3xl border border-[#eceae6] shadow-card space-y-6">
          <div className="text-center pb-4 border-b border-stone-100">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Printable Tent Card Preview
            </span>
            <h3 className="text-xl font-black text-stone-900 tracking-tight mt-1">
              {selectedTable.tableNumber}
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              {restaurant.name} &bull; {selectedTable.zone}
            </p>
          </div>

          {/* Table Stand Card Layout Simulation */}
          <div className="p-6 rounded-3xl bg-[#faf9f6] border-2 border-dashed border-stone-200 text-center space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-[#1f4e47] text-white flex items-center justify-center mx-auto shadow-sm">
              <QrCode className="w-5 h-5 text-[#efa736]" />
            </div>

            <div>
              <h4 className="text-base font-extrabold text-stone-900 tracking-tight">
                Scan to Order &amp; Pay
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                No app download needed &bull; Direct digital table service
              </p>
            </div>

            {/* High-res QR Display */}
            <div className="p-4 bg-white rounded-2xl shadow-sm inline-block border border-stone-100">
              <QRCodeSVG
                value={`${restaurantUrl}?table=${encodeURIComponent(selectedTable.tableNumber)}`}
                size={180}
                level="H"
                includeMargin={false}
                fgColor="#1c1917"
                bgColor="#ffffff"
              />
            </div>

            <div className="text-center pt-2">
              <span className="text-xs font-black tracking-wider uppercase text-stone-700 block">
                {selectedTable.tableNumber}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                {restaurant.slug}.bitepoint.app
              </span>
            </div>
          </div>

          {/* Action Buttons for Selected Table */}
          <div className="space-y-2 pt-2">
            <Button
              variant="primary"
              onClick={() => handleDownloadQr(selectedTable.tableNumber)}
              className="w-full font-bold text-xs gap-2 py-2.5 rounded-2xl bg-[#efa736] hover:bg-[#e09827] text-stone-950 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download High-Res QR (PNG)</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleCopyLink(selectedTable.tableNumber, selectedTable.id)}
              className="w-full text-xs gap-2 py-2.5 rounded-2xl bg-white shadow-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Direct Table URL</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
