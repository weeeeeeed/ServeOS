'use client';

import React, { useState } from 'react';
import {
  Store,
  Clock,
  Percent,
  Printer,
  ShieldCheck,
  Save,
  CheckCircle2,
  Sparkles,
  MapPin,
  Phone,
  Globe,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { Restaurant } from '@/lib/types';
import { AuthService } from '@/lib/auth-service';
import { BotanicalLeafBranch } from '@/components/ui/botanical-decorations';

interface BitepointSettingsProps {
  restaurant: Restaurant;
  onUpdateRestaurant?: (updated: Restaurant) => void;
}

export function BitepointSettings({ restaurant, onUpdateRestaurant }: BitepointSettingsProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'hours' | 'ordering'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [name, setName] = useState(restaurant.name || '');
  const [address, setAddress] = useState(restaurant.address || '');
  const [phone, setPhone] = useState(restaurant.phone || '');
  const [description, setDescription] = useState(restaurant.description || '');

  const [openingHours, setOpeningHours] = useState(restaurant.opening_hours || '11:00 AM - 11:00 PM');
  const [taxRate, setTaxRate] = useState('5.0');
  const [autoAcceptOrders, setAutoAcceptOrders] = useState(false);
  const [enableNotes, setEnableNotes] = useState(true);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await AuthService.updateRestaurantProfile(restaurant.id, {
        name,
        address,
        phone,
        description,
        opening_hours: openingHours,
      });

      if (onUpdateRestaurant) onUpdateRestaurant(updated);
      toast.success('Settings Saved ✅', 'Restaurant configuration updated successfully');
    } catch (err: any) {
      toast.error('Save Failed', err?.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6e2da]">
        <div>
          <h2 className="text-2xl lg:text-3xl font-serif font-bold text-[#1b3b2f] tracking-tight">
            Settings &amp; Configuration
          </h2>
          <p className="text-xs lg:text-[13px] text-[#556960] mt-1 font-sans">
            Manage your restaurant profile, dining hours, operational policies, and order fulfillment rules
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="text-xs font-semibold gap-2 rounded-2xl bg-[#1b3b2f] hover:bg-[#122820] text-[#f8faf7] px-5 py-2 shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
        </Button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#f4f1eb] text-xs font-semibold text-[#556960] overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile' ? 'bg-[#1b3b2f] text-white font-bold shadow-xs' : 'hover:text-[#1b3b2f] hover:bg-white/60'
          }`}
          type="button"
        >
          <Store className="w-4 h-4" />
          <span>Restaurant Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('hours')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'hours' ? 'bg-[#1b3b2f] text-white font-bold shadow-xs' : 'hover:text-[#1b3b2f] hover:bg-white/60'
          }`}
          type="button"
        >
          <Clock className="w-4 h-4" />
          <span>Service Hours</span>
        </button>

        <button
          onClick={() => setActiveTab('ordering')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ordering' ? 'bg-[#1b3b2f] text-white font-bold shadow-xs' : 'hover:text-[#1b3b2f] hover:bg-white/60'
          }`}
          type="button"
        >
          <Percent className="w-4 h-4" />
          <span>Ordering &amp; Tax Policies</span>
        </button>
      </div>

      {/* Profile Form */}
      {activeTab === 'profile' && (
        <div className="bg-white/95 rounded-3xl p-6 lg:p-7 border border-[#e6e2da] shadow-2xs space-y-6 max-w-3xl">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1b3b2f] uppercase tracking-wider mb-1.5">
                Establishment Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-2xl border border-[#dcd7ce] bg-[#faf8f5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3a7d5c] text-[#162820]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1b3b2f] uppercase tracking-wider mb-1.5">
                  Public URL Slug
                </label>
                <div className="flex items-center px-3 py-2 text-xs rounded-2xl border border-[#dcd7ce] bg-[#f4f1eb] text-[#556960] font-mono">
                  <span>/r/</span>
                  <span className="font-bold text-[#1b3b2f]">{restaurant.slug}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b3b2f] uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98450 12345"
                  className="w-full px-4 py-2.5 text-xs rounded-2xl border border-[#dcd7ce] bg-[#faf8f5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3a7d5c] text-[#162820]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1b3b2f] uppercase tracking-wider mb-1.5">
                Physical Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 148 Botanical Terrace, Civil Lines"
                className="w-full px-4 py-2.5 text-xs rounded-2xl border border-[#dcd7ce] bg-[#faf8f5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3a7d5c] text-[#162820]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1b3b2f] uppercase tracking-wider mb-1.5">
                Restaurant Description &amp; Bio
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of your restaurant cuisine, atmosphere, and specialties..."
                className="w-full px-4 py-2.5 text-xs rounded-2xl border border-[#dcd7ce] bg-[#faf8f5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3a7d5c] text-[#162820]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Service Hours */}
      {activeTab === 'hours' && (
        <div className="bg-white/95 rounded-3xl p-6 lg:p-7 border border-[#e6e2da] shadow-2xs space-y-4 max-w-3xl">
          <h3 className="font-serif font-bold text-base text-[#1b3b2f] mb-2">Weekly Dining Schedule</h3>
          <div className="space-y-3">
            {[
              { day: 'Monday – Thursday', time: '11:00 AM – 10:30 PM', open: true },
              { day: 'Friday', time: '11:00 AM – 11:30 PM', open: true },
              { day: 'Saturday', time: '10:30 AM – 11:30 PM', open: true },
              { day: 'Sunday', time: '10:30 AM – 10:00 PM', open: true },
            ].map((schedule) => (
              <div
                key={schedule.day}
                className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e6e2da] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#3a7d5c]" />
                  <span className="font-bold text-[#162820]">{schedule.day}</span>
                </div>
                <span className="font-mono text-[#556960]">{schedule.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ordering Policies */}
      {activeTab === 'ordering' && (
        <div className="bg-white/95 rounded-3xl p-6 lg:p-7 border border-[#e6e2da] shadow-2xs space-y-6 max-w-3xl">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1b3b2f] uppercase tracking-wider mb-1.5">
                GST / Tax Percentage (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full sm:w-48 px-4 py-2.5 text-xs rounded-2xl border border-[#dcd7ce] bg-[#faf8f5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3a7d5c] text-[#162820]"
              />
              <p className="text-[11px] text-[#85988e] mt-1">Standard restaurant dining GST in India is 5.0%</p>
            </div>

            <div className="pt-4 border-t border-[#f0ede6] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#1b3b2f]">Auto-Accept Incoming Orders</p>
                  <p className="text-[11px] text-[#556960]">Automatically transition new QR guest orders directly to kitchen prep</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoAcceptOrders}
                  onChange={(e) => setAutoAcceptOrders(e.target.checked)}
                  className="w-4 h-4 accent-[#1b3b2f] rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#1b3b2f]">Allow Kitchen Notes from Guests</p>
                  <p className="text-[11px] text-[#556960]">Permit diners to enter custom allergy or prep requests on menu dishes</p>
                </div>
                <input
                  type="checkbox"
                  checked={enableNotes}
                  onChange={(e) => setEnableNotes(e.target.checked)}
                  className="w-4 h-4 accent-[#1b3b2f] rounded"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
