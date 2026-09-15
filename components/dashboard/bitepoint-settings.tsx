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

interface BitepointSettingsProps {
  restaurant: Restaurant;
  onUpdateRestaurant?: (updated: Restaurant) => void;
}

export function BitepointSettings({ restaurant, onUpdateRestaurant }: BitepointSettingsProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'hours' | 'ordering' | 'staff'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [name, setName] = useState(restaurant.name);
  const [address, setAddress] = useState(restaurant.address || '148 Elmwood Boulevard, Downtown');
  const [phone, setPhone] = useState(restaurant.phone || '+1 (555) 234-8900');
  const [description, setDescription] = useState(
    restaurant.description || 'Authentic artisan wood-fired dining and craft refreshments.'
  );

  const [openingHours, setOpeningHours] = useState('11:00 AM - 10:30 PM');
  const [taxRate, setTaxRate] = useState('8.5');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/70">
        <div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            Settings &amp; Configuration
          </h2>
          <p className="text-xs text-stone-500 mt-0.5 font-medium">
            Manage your restaurant profile, dining hours, operational policies, and order fulfillment rules
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="text-xs font-bold gap-2 rounded-2xl bg-[#efa736] hover:bg-[#e09827] text-stone-950 shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </Button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-stone-100 text-xs font-semibold text-stone-600 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile' ? 'bg-stone-900 text-white font-bold shadow-xs' : 'hover:text-stone-900 hover:bg-white/50'
          }`}
          type="button"
        >
          <Store className="w-4 h-4" />
          <span>Restaurant Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('hours')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'hours' ? 'bg-stone-900 text-white font-bold shadow-xs' : 'hover:text-stone-900 hover:bg-white/50'
          }`}
          type="button"
        >
          <Clock className="w-4 h-4" />
          <span>Service Hours</span>
        </button>

        <button
          onClick={() => setActiveTab('ordering')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ordering' ? 'bg-stone-900 text-white font-bold shadow-xs' : 'hover:text-stone-900 hover:bg-white/50'
          }`}
          type="button"
        >
          <Percent className="w-4 h-4" />
          <span>Ordering &amp; Tax Policies</span>
        </button>
      </div>

      {/* Profile Form */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 border border-[#eceae6] shadow-card space-y-6 max-w-3xl">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Establishment Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-2xl border border-stone-200/80 bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#efa736]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Public URL Slug
                </label>
                <div className="flex items-center px-3 py-2 text-xs rounded-2xl border border-stone-200 bg-stone-100 text-stone-500 font-mono">
                  <span>/r/</span>
                  <span className="font-bold text-stone-800">{restaurant.slug}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-2xl border border-stone-200/80 bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#efa736]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Physical Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-2xl border border-stone-200/80 bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#efa736]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Restaurant Description &amp; Bio
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-2xl border border-stone-200/80 bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#efa736]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Service Hours */}
      {activeTab === 'hours' && (
        <div className="bg-white rounded-3xl p-6 border border-[#eceae6] shadow-card space-y-6 max-w-3xl">
          <div className="space-y-3">
            {[
              { day: 'Monday – Thursday', time: '11:00 AM – 10:00 PM', open: true },
              { day: 'Friday', time: '11:00 AM – 11:30 PM', open: true },
              { day: 'Saturday', time: '10:00 AM – 11:30 PM', open: true },
              { day: 'Sunday', time: '10:00 AM – 09:30 PM', open: true },
            ].map((schedule) => (
              <div
                key={schedule.day}
                className="p-3.5 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#109955]" />
                  <span className="font-bold text-stone-800">{schedule.day}</span>
                </div>
                <span className="font-mono text-stone-500">{schedule.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ordering Policies */}
      {activeTab === 'ordering' && (
        <div className="bg-white rounded-3xl p-6 border border-[#eceae6] shadow-card space-y-6 max-w-3xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-100">
              <div>
                <h4 className="text-xs font-bold text-stone-900">Allow Customer Chef Notes</h4>
                <p className="text-[11px] text-stone-500">Enable diners to write allergy and preparation notes on orders</p>
              </div>
              <input
                type="checkbox"
                checked={enableNotes}
                onChange={(e) => setEnableNotes(e.target.checked)}
                className="w-4 h-4 rounded text-[#efa736] focus:ring-[#efa736]"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-100">
              <div>
                <h4 className="text-xs font-bold text-stone-900">Auto-Accept Incoming Orders</h4>
                <p className="text-[11px] text-stone-500">Automatically route orders directly to the kitchen without manual acceptance</p>
              </div>
              <input
                type="checkbox"
                checked={autoAcceptOrders}
                onChange={(e) => setAutoAcceptOrders(e.target.checked)}
                className="w-4 h-4 rounded text-[#efa736] focus:ring-[#efa736]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Sales Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-48 px-4 py-2 text-xs rounded-2xl border border-stone-200/80 bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#efa736]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
