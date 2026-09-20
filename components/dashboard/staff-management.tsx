'use client';

import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  Clock,
  Shield,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  MoreVertical,
  Edit2,
  ChefHat,
  Coffee,
  Check,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { Restaurant } from '@/lib/types';
import { HandwrittenNote, BotanicalLeafBranch } from '@/components/ui/botanical-decorations';

interface StaffMember {
  id: string;
  name: string;
  role: 'Head Chef' | 'Sous Chef' | 'Floor Manager' | 'Lead Server' | 'Barista & Mixologist' | 'Host & Cashier';
  avatarInitials: string;
  phone: string;
  email: string;
  shift: string;
  zone: string;
  status: 'active' | 'on_break' | 'off_duty';
  joinedDate: string;
}

export function StaffManagement({ restaurant }: { restaurant: Restaurant }) {
  const toast = useToast();
  const storageKey = `serveos_staff_${restaurant.id}`;

  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    // Default to the registered restaurant lead
    return [
      {
        id: `staff-lead-${restaurant.id.slice(0, 6)}`,
        name: `${restaurant.name} Operations`,
        role: 'Floor Manager',
        avatarInitials: restaurant.name.slice(0, 2).toUpperCase(),
        phone: restaurant.phone || 'On file',
        email: `${restaurant.slug}@serveos.internal`,
        shift: 'Operational Hours',
        zone: 'All Dining Zones',
        status: 'active',
        joinedDate: 'Active',
      },
    ];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'Lead Server' as StaffMember['role'],
    phone: '',
    email: '',
    shift: '11:00 AM - 09:00 PM',
    zone: 'Main Dining Room',
  });

  const saveStaff = (updated: StaffMember[]) => {
    setStaffList(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to persist staff', e);
      }
    }
  };

  const filteredStaff = staffList.filter((m) => {
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    const matchesSearch =
      !searchQuery ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.zone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleToggleStatus = (id: string) => {
    const updated = staffList.map((s) => {
      if (s.id !== id) return s;
      const nextStatus = s.status === 'active' ? 'on_break' : s.status === 'on_break' ? 'off_duty' : 'active';
      toast.info('Status Updated', `${s.name} is now ${nextStatus.replace('_', ' ')}`);
      return { ...s, status: nextStatus as StaffMember['status'] };
    });
    saveStaff(updated);
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name.trim()) {
      toast.warning('Name required', 'Please enter staff member name');
      return;
    }
    const initials = newStaff.name
      .trim()
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const created: StaffMember = {
      id: 's_' + Date.now(),
      name: newStaff.name.trim(),
      role: newStaff.role,
      avatarInitials: initials || 'ST',
      phone: newStaff.phone.trim() || '+91 98000 00000',
      email: newStaff.email.trim() || `${newStaff.name.toLowerCase().replace(/\s+/g, '')}@serveos.internal`,
      shift: newStaff.shift,
      zone: newStaff.zone,
      status: 'active',
      joinedDate: 'Today',
    };

    saveStaff([created, ...staffList]);
    setIsAddModalOpen(false);
    setNewStaff({
      name: '',
      role: 'Lead Server',
      phone: '',
      email: '',
      shift: '11:00 AM - 09:00 PM',
      zone: 'Main Dining Room',
    });
    toast.success('Staff Member Added', `${created.name} added to roster`);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-[#e6e2da]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#1b3b2f] tracking-tight">
              Staff &amp; Team Roster
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#eef4f0] text-[#1b3b2f] border border-[#d2ded6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3a7d5c] animate-pulse" />
              {staffList.filter((s) => s.status === 'active').length} On Floor Today
            </span>
          </div>
          <p className="text-xs lg:text-[13px] text-[#556960] mt-1 font-sans">
            {restaurant.name} &bull; Manage server table assignments, culinary shifts, and operational roles
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#85988e] pointer-events-none" />
            <input
              type="text"
              placeholder="Search team by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] placeholder-[#85988e] focus:outline-none focus:ring-2 focus:ring-[#3a7d5c] shadow-xs"
            />
          </div>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#1b3b2f] hover:bg-[#122820] text-[#f8faf7] font-sans text-xs font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Team Member</span>
          </Button>
        </div>
      </header>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/90 p-5 rounded-3xl border border-[#e6e2da] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#556960] uppercase tracking-wider">Active Shift</span>
            <div className="w-8 h-8 rounded-2xl bg-[#eef4f0] text-[#1b3b2f] flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-serif font-bold text-[#1b3b2f]">
            {staffList.filter((s) => s.status === 'active').length} Members
          </div>
          <div className="text-[11px] text-[#3a7d5c] mt-1 font-medium flex items-center gap-1">
            <span>● 100% floor stations covered</span>
          </div>
        </div>

        <div className="bg-white/90 p-5 rounded-3xl border border-[#e6e2da] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#556960] uppercase tracking-wider">On Break</span>
            <div className="w-8 h-8 rounded-2xl bg-[#fdf8ee] text-[#b8782a] flex items-center justify-center">
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-serif font-bold text-[#1b3b2f]">
            {staffList.filter((s) => s.status === 'on_break').length} Member
          </div>
          <div className="text-[11px] text-[#85988e] mt-1">
            Expected return within 15 mins
          </div>
        </div>

        <div className="bg-white/90 p-5 rounded-3xl border border-[#e6e2da] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#556960] uppercase tracking-wider">Total Roster</span>
            <div className="w-8 h-8 rounded-2xl bg-[#eef4f0] text-[#1b3b2f] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-serif font-bold text-[#1b3b2f]">
            {staffList.length} Team Members
          </div>
          <div className="text-[11px] text-[#556960] mt-1">
            Front of House &amp; Culinary Kitchen
          </div>
        </div>
      </div>

      {/* Staff Cards Grid */}
      {filteredStaff.length === 0 ? (
        <div className="bg-white/90 rounded-3xl p-12 border border-[#e6e2da] text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#eef4f0] text-[#1b3b2f] flex items-center justify-center mx-auto mb-3">
            <Users className="w-5 h-5 text-[#3a7d5c]" />
          </div>
          <p className="font-serif font-bold text-base text-[#1b3b2f]">No Team Members Found</p>
          <p className="text-xs text-[#556960] mt-1 mb-4">
            Add your chef, servers, and floor managers to schedule shifts and station assignments.
          </p>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-2xl text-xs font-semibold bg-[#1b3b2f] text-white px-4 py-2"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Team Member</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((member) => {
            const statusBadge =
              member.status === 'active'
                ? { label: 'Active on Shift', bg: 'bg-[#eef4f0] text-[#1b3b2f] border-[#cbe0d3]' }
                : member.status === 'on_break'
                ? { label: 'On Rest Break', bg: 'bg-[#fdf8ee] text-[#b8782a] border-[#fae2be]' }
                : { label: 'Off Duty', bg: 'bg-[#f4f1eb] text-[#85988e] border-[#e6e2da]' };

            return (
              <div
                key={member.id}
                className="bg-white/95 rounded-3xl p-5 border border-[#e6e2da] shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#eef4f0] text-[#1b3b2f] font-serif font-bold text-base flex items-center justify-center border border-[#d2ded6]">
                        {member.avatarInitials}
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-base text-[#1b3b2f] leading-tight">
                          {member.name}
                        </h3>
                        <p className="text-xs font-medium text-[#556960] mt-0.5">
                          {member.role}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleStatus(member.id)}
                      title="Click to toggle status"
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${statusBadge.bg} transition-transform active:scale-95`}
                    >
                      {statusBadge.label}
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#f0ede6] space-y-2 text-xs text-[#556960]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#85988e]">Assigned Station:</span>
                      <span className="font-medium text-[#162820]">{member.zone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#85988e]">Daily Shift:</span>
                      <span className="font-medium text-[#162820]">{member.shift}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#85988e]">Contact:</span>
                      <span className="font-sans text-[11px] text-[#1b3b2f] font-medium">{member.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#f0ede6] flex items-center justify-between">
                  <span className="text-[11px] text-[#85988e]">Joined {member.joinedDate}</span>
                  <button
                    onClick={() => handleToggleStatus(member.id)}
                    className="text-xs font-semibold text-[#1b3b2f] hover:text-[#3a7d5c] underline decoration-[#cbe0d3] hover:decoration-[#1b3b2f] transition-colors"
                  >
                    Change Status &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-[#faf8f5] rounded-4xl p-7 max-w-md w-full border border-[#e6e2da] shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#e6e2da]">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#1b3b2f]">Add Staff Member</h3>
                <p className="text-xs text-[#556960] mt-0.5">Invite a server, chef, or manager to ServeOS</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white text-[#556960] hover:text-[#1b3b2f] flex items-center justify-center border border-[#e6e2da]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1b3b2f] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam Anderson"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] focus:ring-2 focus:ring-[#3a7d5c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b3b2f] mb-1">Role</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] focus:ring-2 focus:ring-[#3a7d5c] focus:outline-none"
                >
                  <option value="Lead Server">Lead Server</option>
                  <option value="Head Chef">Head Chef</option>
                  <option value="Sous Chef">Sous Chef</option>
                  <option value="Floor Manager">Floor Manager</option>
                  <option value="Barista & Mixologist">Barista & Mixologist</option>
                  <option value="Host & Cashier">Host & Cashier</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b3b2f] mb-1">Floor Zone / Station</label>
                <input
                  type="text"
                  placeholder="e.g. Terrace Garden or Main Dining"
                  value={newStaff.zone}
                  onChange={(e) => setNewStaff({ ...newStaff, zone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] focus:ring-2 focus:ring-[#3a7d5c] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1b3b2f] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98450 00000"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] focus:ring-2 focus:ring-[#3a7d5c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1b3b2f] mb-1">Shift Timings</label>
                  <input
                    type="text"
                    placeholder="11:00 AM - 09:00 PM"
                    value={newStaff.shift}
                    onChange={(e) => setNewStaff({ ...newStaff, shift: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] focus:ring-2 focus:ring-[#3a7d5c] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-2xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#1b3b2f] hover:bg-[#122820] text-[#f8faf7] rounded-2xl text-xs font-semibold"
                >
                  Add Team Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
