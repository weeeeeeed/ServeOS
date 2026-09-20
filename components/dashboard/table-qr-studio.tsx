'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Share2,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Restaurant, RestaurantTable, TableStatus } from '@/lib/types';
import { ServeOSLogo } from '@/components/ui/botanical-decorations';
import { TableService } from '@/lib/table-service';

interface TableQrStudioProps {
  restaurant: Restaurant;
  tables?: RestaurantTable[];
  onTablesUpdated?: () => void;
}

const COMMON_ZONES = [
  'Main Dining',
  'Terrace Garden',
  'Botanical Bar',
  'VIP Lounge',
  'Patio',
  'Rooftop',
  'Balcony',
  'Courtyard',
];

export function TableQrStudio({ restaurant, tables: initialTables, onTablesUpdated }: TableQrStudioProps) {
  const toast = useToast();
  const [tables, setTables] = useState<RestaurantTable[]>(initialTables || []);
  const [loading, setLoading] = useState(!initialTables || initialTables.length === 0);
  const [activeZone, setActiveZone] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [deletingTable, setDeletingTable] = useState<RestaurantTable | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for Add/Edit
  const [formName, setFormName] = useState('');
  const [formZone, setFormZone] = useState('Main Dining');
  const [formCustomZone, setFormCustomZone] = useState('');
  const [formCapacity, setFormCapacity] = useState(4);
  const [formStatus, setFormStatus] = useState<TableStatus>('active');

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const restaurantUrl = `${baseUrl}/r/${restaurant.slug}`;

  // Load tables
  const loadTables = async (silent = false) => {
    try {
      if (!silent && tables.length === 0) {
        setLoading(true);
      }
      const data = await TableService.getTables(restaurant.id);
      setTables(data);
      setSelectedTable((prev) => {
        if (!prev) return data[0] || null;
        return data.find((t) => t.id === prev.id) || data[0] || null;
      });
    } catch (err) {
      console.error('Failed to load tables:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTables && initialTables.length > 0) {
      setTables(initialTables);
      setSelectedTable((prev) => {
        if (!prev) return initialTables[0] || null;
        return initialTables.find((t) => t.id === prev.id) || initialTables[0] || null;
      });
      setLoading(false);
    } else {
      loadTables(false);
    }
  }, [restaurant.id, initialTables]);

  // Listen to cross-tab & parent table update events
  useEffect(() => {
    const handleUpdated = (e: any) => {
      if (!e.detail || e.detail.restaurantId === restaurant.id) {
        if (e.detail?.tables && Array.isArray(e.detail.tables)) {
          setTables(e.detail.tables);
          setSelectedTable((prev) => {
            if (!prev) return e.detail.tables[0] || null;
            return e.detail.tables.find((t: any) => t.id === prev.id) || e.detail.tables[0] || null;
          });
        } else {
          loadTables(true);
        }
      }
    };
    window.addEventListener('serveos_tables_updated', handleUpdated);
    return () => window.removeEventListener('serveos_tables_updated', handleUpdated);
  }, [restaurant.id]);

  // Extract unique zones dynamically
  const uniqueZones = useMemo(() => {
    const set = new Set<string>();
    tables.forEach((t) => {
      if (t.zone) set.add(t.zone);
    });
    return Array.from(set);
  }, [tables]);

  // Filtered tables
  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchesZone = activeZone === 'all' || t.zone.toLowerCase() === activeZone.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.zone.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesZone && matchesSearch;
    });
  }, [tables, activeZone, searchQuery]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    const nextNumber = tables.length + 1;
    setFormName(`Table ${nextNumber}`);
    setFormZone(uniqueZones[0] || 'Main Dining');
    setFormCustomZone('');
    setFormCapacity(4);
    setFormStatus('active');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (tbl: RestaurantTable, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTable(tbl);
    setFormName(tbl.name);
    setFormZone(COMMON_ZONES.includes(tbl.zone) ? tbl.zone : 'Other');
    setFormCustomZone(COMMON_ZONES.includes(tbl.zone) ? '' : tbl.zone);
    setFormCapacity(tbl.capacity);
    setFormStatus(tbl.status);
  };

  // Submit Add Table
  const handleSaveNewTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Table Name Required', 'Please provide a name for this table');
      return;
    }
    const finalZone = formZone === 'Other' ? (formCustomZone.trim() || 'Main Dining') : formZone;

    setIsSubmitting(true);
    try {
      const created = await TableService.createTable({
        restaurantId: restaurant.id,
        name: formName.trim(),
        zone: finalZone,
        capacity: formCapacity,
        status: formStatus,
      });

      toast.success('Table Added', `${created.name} registered in ${created.zone}`);
      setIsAddModalOpen(false);
      await loadTables();
      setSelectedTable(created);
      if (onTablesUpdated) onTablesUpdated();
    } catch (err: any) {
      toast.error('Error Adding Table', err?.message || 'Could not register table');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Table
  const handleSaveEditTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable || !formName.trim()) return;
    const finalZone = formZone === 'Other' ? (formCustomZone.trim() || 'Main Dining') : formZone;

    setIsSubmitting(true);
    try {
      const updated = await TableService.updateTable(editingTable.id, restaurant.id, {
        name: formName.trim(),
        zone: finalZone,
        capacity: formCapacity,
        status: formStatus,
      });

      toast.success('Table Updated', `${updated.name} configuration saved`);
      setEditingTable(null);
      await loadTables();
      setSelectedTable(updated);
      if (onTablesUpdated) onTablesUpdated();
    } catch (err: any) {
      toast.error('Error Updating Table', err?.message || 'Could not update table');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Table
  const handleConfirmDelete = async () => {
    if (!deletingTable) return;
    setIsSubmitting(true);
    try {
      await TableService.deleteTable(deletingTable.id, restaurant.id);
      toast.success('Table Removed', `${deletingTable.name} was successfully deleted`);
      setDeletingTable(null);
      await loadTables();
      if (onTablesUpdated) onTablesUpdated();
    } catch (err: any) {
      toast.error('Error Deleting Table', err?.message || 'Could not delete table');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = (tableNum: string, id: string) => {
    const tableUrl = `${restaurantUrl}?table=${encodeURIComponent(tableNum)}`;
    navigator.clipboard.writeText(tableUrl);
    setCopiedId(id);
    toast.success('Link Copied 📋', `Direct dining link for ${tableNum} copied`);
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
        ctx.fillStyle = '#faf8f5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 50, 50, 500, 500);

        const a = document.createElement('a');
        a.download = `ServeOS-QR-${restaurant.slug}-${tableNum.replace(/\s+/g, '-').toLowerCase()}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
        toast.success('Downloaded PNG', `High-resolution QR sign for ${tableNum}`);
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6e2da]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#1b3b2f] tracking-tight">
              Table QR Studio &amp; Floor Setup
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eef4f0] text-[#1b3b2f] border border-[#d2ded6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3a7d5c]" />
              {tables.length} Active Tables
            </span>
          </div>
          <p className="text-xs lg:text-[13px] text-[#556960] mt-1 font-sans">
            Add custom tables, rename dining spots, customize seating zones, and generate high-res QR stands
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#85988e] pointer-events-none" />
            <input
              type="text"
              placeholder="Search table or zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] placeholder-[#85988e] focus:outline-none focus:ring-2 focus:ring-[#3a7d5c] shadow-2xs"
            />
          </div>

          <Button
            onClick={handleOpenAddModal}
            className="bg-[#1b3b2f] hover:bg-[#122820] text-white rounded-2xl text-xs font-semibold px-4 py-2 flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4 text-[#eef4f0]" />
            <span>Add Table</span>
          </Button>
        </div>
      </header>

      {/* Main Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Table Roster */}
        <div className="lg:col-span-2 space-y-4">
          {/* Dynamic Zone Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#f4f1eb] text-xs font-semibold text-[#556960] overflow-x-auto">
            <button
              onClick={() => setActiveZone('all')}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeZone === 'all'
                  ? 'bg-[#1b3b2f] text-white font-bold shadow-xs'
                  : 'hover:text-[#1b3b2f] hover:bg-white/60'
              }`}
              type="button"
            >
              All Zones ({tables.length})
            </button>
            {uniqueZones.map((z) => {
              const count = tables.filter((t) => t.zone.toLowerCase() === z.toLowerCase()).length;
              return (
                <button
                  key={z}
                  onClick={() => setActiveZone(z)}
                  className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                    activeZone.toLowerCase() === z.toLowerCase()
                      ? 'bg-[#1b3b2f] text-white font-bold shadow-xs'
                      : 'hover:text-[#1b3b2f] hover:bg-white/60'
                  }`}
                  type="button"
                >
                  {z} ({count})
                </button>
              );
            })}
          </div>

          {/* Tables Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 rounded-3xl bg-[#ebe7df] animate-pulse" />
              ))}
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="bg-white/95 rounded-3xl p-12 border border-[#e6e2da] text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-[#eef4f0] flex items-center justify-center text-[#3a7d5c] mx-auto">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1b3b2f]">No Tables Found</h3>
              <p className="text-xs text-[#556960] max-w-sm mx-auto">
                {searchQuery || activeZone !== 'all'
                  ? 'Try adjusting your search query or zone filter.'
                  : 'You have not added any tables to this restaurant yet.'}
              </p>
              <Button
                onClick={handleOpenAddModal}
                className="bg-[#1b3b2f] hover:bg-[#122820] text-white rounded-2xl text-xs font-semibold px-4 py-2 mt-2"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add First Table
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {filteredTables.map((tbl) => {
                const isSelected = selectedTable?.id === tbl.id;
                const isCopied = copiedId === tbl.id;
                const statusBadge =
                  tbl.status === 'in_service'
                    ? { label: 'In Service', bg: 'bg-[#eef4f0] text-[#1b3b2f] border-[#cbe0d3]' }
                    : tbl.status === 'active'
                    ? { label: 'Active', bg: 'bg-[#faf8f5] text-[#556960] border-[#e6e2da]' }
                    : tbl.status === 'reserved'
                    ? { label: 'Reserved', bg: 'bg-[#fef9ee] text-[#b8782a] border-[#faecc5]' }
                    : { label: 'Idle', bg: 'bg-[#f4f1eb] text-[#85988e] border-[#e6e2da]' };

                return (
                  <div
                    key={tbl.id}
                    onClick={() => setSelectedTable(tbl)}
                    className={`cursor-pointer rounded-3xl p-4 border transition-all duration-150 flex flex-col justify-between min-h-[140px] group ${
                      isSelected
                        ? 'border-[#1b3b2f] bg-white ring-2 ring-[#1b3b2f] shadow-sm'
                        : 'border-[#e6e2da] bg-white/90 hover:bg-white hover:border-[#c5beb2] shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-serif font-bold text-lg text-[#1b3b2f] group-hover:text-[#3a7d5c] transition-colors">
                            {tbl.name}
                          </h3>
                          <p className="text-[11px] text-[#556960] mt-0.5">{tbl.zone}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.bg}`}>
                            {statusBadge.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#f0ede6] flex items-center justify-between">
                      <span className="text-[11px] text-[#85988e] flex items-center gap-1">
                        <Users className="w-3 h-3" /> {tbl.capacity} Seats
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleOpenEditModal(tbl, e)}
                          className="p-1.5 rounded-lg hover:bg-[#eef4f0] text-[#556960] hover:text-[#1b3b2f] transition-colors"
                          title="Rename / Edit Table"
                          type="button"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingTable(tbl);
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-[#85988e] hover:text-red-600 transition-colors"
                          title="Delete Table"
                          type="button"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink(tbl.name, tbl.id);
                          }}
                          className="text-xs font-semibold text-[#1b3b2f] hover:text-[#3a7d5c] flex items-center gap-1 p-1 rounded-lg hover:bg-[#eef4f0] transition-colors"
                          title="Copy Direct Link"
                          type="button"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-[#3a7d5c]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: High-Res Table Stand Mockup */}
        <div className="bg-white/95 rounded-3xl p-6 lg:p-7 border border-[#e6e2da] shadow-xs flex flex-col items-center justify-between text-center relative overflow-hidden">
          {selectedTable ? (
            <>
              <div className="w-full">
                <div className="flex items-center justify-between pb-3 border-b border-[#f0ede6] w-full text-left">
                  <div>
                    <span className="text-xs font-bold text-[#1b3b2f] uppercase tracking-wider block">
                      Stand QR Preview
                    </span>
                    <span className="text-[11px] text-[#556960]">
                      For {selectedTable.name} &bull; {selectedTable.capacity} Seats
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenEditModal(selectedTable)}
                    className="text-xs font-semibold text-[#3a7d5c] hover:text-[#1b3b2f] flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#eef4f0]"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Rename</span>
                  </button>
                </div>

                {/* Stand Container Mockup */}
                <div className="mt-6 mx-auto w-full max-w-[280px] bg-[#faf8f5] rounded-3xl p-6 border-2 border-[#e6e2da] shadow-sm relative">
                  <div className="w-9 h-9 rounded-2xl bg-[#eef4f0] text-[#1b3b2f] flex items-center justify-center mx-auto mb-3 border border-[#d2ded6]">
                    <ServeOSLogo size="sm" variant="icon-only" />
                  </div>

                  <h4 className="font-serif font-bold text-base text-[#1b3b2f] tracking-tight">
                    {restaurant.name}
                  </h4>
                  <p className="text-[11px] text-[#556960] mt-0.5">
                    Scan with phone camera to order
                  </p>

                  {/* QR Code Container */}
                  <div className="my-5 p-4 bg-white rounded-2xl border border-[#e6e2da] inline-block shadow-2xs">
                    <QRCodeSVG
                      id={`qr-svg-${selectedTable.name}`}
                      value={`${restaurantUrl}?table=${encodeURIComponent(selectedTable.name)}`}
                      size={150}
                      level="H"
                      includeMargin={false}
                      fgColor="#1b3b2f"
                      bgColor="#ffffff"
                    />
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eef4f0] text-[#1b3b2f] border border-[#d2ded6] text-xs font-bold font-serif">
                    {selectedTable.name} &bull; {selectedTable.zone}
                  </div>

                  <p className="text-[9px] text-[#85988e] uppercase tracking-widest mt-4">
                    POWERED BY SERVEOS
                  </p>
                </div>
              </div>

              {/* Stand Action Buttons */}
              <div className="w-full mt-6 space-y-2">
                <Button
                  onClick={() => handleDownloadQr(selectedTable.name)}
                  className="w-full bg-[#1b3b2f] hover:bg-[#122820] text-[#f8faf7] rounded-2xl text-xs font-semibold py-2.5 flex items-center justify-center gap-2 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download High-Res PNG</span>
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.print();
                    }}
                    className="w-full rounded-2xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Stand</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleCopyLink(selectedTable.name, selectedTable.id)}
                    className="w-full rounded-2xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Link</span>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-xs text-[#85988e]">
              Select a table from the list to preview and export its QR stand.
            </div>
          )}
        </div>
      </div>

      {/* Add Table Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-[#faf8f5] rounded-4xl p-6 max-w-md w-full border border-[#e6e2da] shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6e2da]">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1b3b2f]">Add New Dining Table</h3>
                <p className="text-xs text-[#556960]">Create a table and auto-generate its ordering QR code</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white text-[#556960] hover:text-[#1b3b2f] flex items-center justify-center border border-[#e6e2da]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewTable} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1b3b2f] mb-1">
                  Table Name / Number *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Table 7, Patio P-3, Rooftop Gazebo"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] focus:ring-2 focus:ring-[#3a7d5c] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1b3b2f] mb-1">
                    Dining Zone
                  </label>
                  <select
                    value={formZone}
                    onChange={(e) => setFormZone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] focus:ring-2 focus:ring-[#3a7d5c] focus:outline-none"
                  >
                    {COMMON_ZONES.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                    <option value="Other">+ Custom Zone...</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1b3b2f] mb-1">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] focus:ring-2 focus:ring-[#3a7d5c] focus:outline-none"
                  />
                </div>
              </div>

              {formZone === 'Other' && (
                <div>
                  <label className="block font-bold text-[#1b3b2f] mb-1">
                    Custom Zone Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCustomZone}
                    onChange={(e) => setFormCustomZone(e.target.value)}
                    placeholder="e.g. Garden Pavilion, Mezzanine"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] focus:ring-2 focus:ring-[#3a7d5c] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-[#1b3b2f] mb-1">
                  Initial Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'active' as const, label: 'Active' },
                    { id: 'in_service' as const, label: 'In Service' },
                    { id: 'idle' as const, label: 'Idle' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setFormStatus(st.id)}
                      className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all ${
                        formStatus === st.id
                          ? 'bg-[#1b3b2f] text-white border-[#1b3b2f]'
                          : 'bg-white text-[#556960] border-[#dcd7ce] hover:border-[#1b3b2f]'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#e6e2da] flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-1/2 rounded-2xl"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 bg-[#1b3b2f] hover:bg-[#122820] text-white rounded-2xl"
                >
                  {isSubmitting ? 'Saving...' : 'Create Table'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Table Modal */}
      {editingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-[#faf8f5] rounded-4xl p-6 max-w-md w-full border border-[#e6e2da] shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6e2da]">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1b3b2f]">Edit Table</h3>
                <p className="text-xs text-[#556960]">Rename or adjust seating for {editingTable.name}</p>
              </div>
              <button
                onClick={() => setEditingTable(null)}
                className="w-8 h-8 rounded-full bg-white text-[#556960] hover:text-[#1b3b2f] flex items-center justify-center border border-[#e6e2da]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTable} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1b3b2f] mb-1">
                  Table Name / Number *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Table 4, Patio P-1"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] focus:ring-2 focus:ring-[#3a7d5c] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1b3b2f] mb-1">
                    Dining Zone
                  </label>
                  <select
                    value={formZone}
                    onChange={(e) => setFormZone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] focus:ring-2 focus:ring-[#3a7d5c] focus:outline-none"
                  >
                    {COMMON_ZONES.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                    <option value="Other">+ Custom Zone...</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1b3b2f] mb-1">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] focus:ring-2 focus:ring-[#3a7d5c] focus:outline-none"
                  />
                </div>
              </div>

              {formZone === 'Other' && (
                <div>
                  <label className="block font-bold text-[#1b3b2f] mb-1">
                    Custom Zone Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCustomZone}
                    onChange={(e) => setFormCustomZone(e.target.value)}
                    placeholder="e.g. Poolside Cabana"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] focus:ring-2 focus:ring-[#3a7d5c] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-[#1b3b2f] mb-1">
                  Status
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'active' as const, label: 'Active' },
                    { id: 'in_service' as const, label: 'In Service' },
                    { id: 'reserved' as const, label: 'Reserved' },
                    { id: 'idle' as const, label: 'Idle' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setFormStatus(st.id)}
                      className={`py-2 px-2 text-[11px] rounded-xl border text-center font-semibold transition-all ${
                        formStatus === st.id
                          ? 'bg-[#1b3b2f] text-white border-[#1b3b2f]'
                          : 'bg-white text-[#556960] border-[#dcd7ce] hover:border-[#1b3b2f]'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#e6e2da] flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-1/2 rounded-2xl"
                  onClick={() => setEditingTable(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 bg-[#1b3b2f] hover:bg-[#122820] text-white rounded-2xl"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-[#faf8f5] rounded-4xl p-6 max-w-sm w-full border border-[#e6e2da] shadow-xl relative animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-[#1b3b2f]">
              Delete {deletingTable.name}?
            </h3>
            <p className="text-xs text-[#556960] mt-1">
              This will remove this table and its QR stand from your restaurant setup. Diners will no longer be able to place orders specifically for this table.
            </p>

            <div className="mt-5 flex gap-2">
              <Button
                variant="outline"
                className="w-1/2 rounded-2xl text-xs"
                onClick={() => setDeletingTable(null)}
              >
                Cancel
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="w-1/2 rounded-2xl text-xs bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
