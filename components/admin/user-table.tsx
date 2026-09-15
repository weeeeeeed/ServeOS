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
    <div id="users" className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-card overflow-hidden">
      {/* Table Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
              Platform Accounts & User Roles
            </h3>
            <p className="text-xs text-zinc-500">
              {filtered.length} registered accounts
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-700 dark:text-zinc-300 focus:outline-none"
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
          <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3">Account Name</th>
              <th className="px-5 py-3">Email Address</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">User ID</th>
              <th className="px-5 py-3 text-right">Registered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-zinc-400">
                  No platform users found.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="px-5 py-4 font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-bold text-[10px] text-zinc-700 dark:text-zinc-300">
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span>{user.name}</span>
                  </td>

                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-zinc-400" />
                      <span>{user.email}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <Badge role={user.role} />
                  </td>

                  <td className="px-5 py-4 font-mono text-[11px] text-zinc-400">
                    {user.id}
                  </td>

                  <td className="px-5 py-4 text-right text-zinc-500 whitespace-nowrap">
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
