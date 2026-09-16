'use client';

import React, { useState } from 'react';
import { Users, Search, Shield, Store, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { User } from '@/lib/types';

interface UserTableProps {
  users: User[];
}

export function UserTable({ users }: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div id="users" className="bg-white rounded-[28px] border border-stone-200 shadow-xs overflow-hidden">
      {/* Table Header */}
      <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-[#faf9f6]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1f4e47] text-[#efa736] flex items-center justify-center shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-base">
              Platform Accounts & User Roles
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              {filtered.length} registered accounts
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:border-[#efa736] focus:ring-[#efa736]/20 text-stone-800"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-stone-700 focus:outline-none focus:border-[#efa736]"
          >
            <option value="all">All Roles</option>
            <option value="admin">Super Admins</option>
            <option value="owner">Restaurant Owners</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#faf9f6] border-b border-stone-200/80 text-stone-500 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-5 py-3">Account Name</th>
              <th className="px-5 py-3">Email Address</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">User ID</th>
              <th className="px-5 py-3 text-right">Registered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-stone-400">
                  No platform users found.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="hover:bg-[#faf9f6]/70 transition-colors">
                  <td className="px-5 py-4 font-bold text-stone-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#1f4e47] text-[#efa736] flex items-center justify-center font-bold text-[11px] shrink-0">
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span>{user.name}</span>
                  </td>

                  <td className="px-5 py-4 text-stone-600">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      <span className="font-mono text-[11px]">{user.email}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    {user.role === 'admin' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[#1f4e47] border border-emerald-200">
                        Super Admin
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                        Restaurant Owner
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 font-mono text-[11px] text-stone-400">
                    {user.id}
                  </td>

                  <td className="px-5 py-4 text-right text-stone-500 whitespace-nowrap">
                    {new Date(user.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
