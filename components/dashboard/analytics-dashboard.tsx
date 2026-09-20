'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Star,
  Clock,
  ArrowUpRight,
  Sparkles,
  Utensils,
  Award,
  Calendar,
  Layers,
  ChevronRight,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnalyticsData } from '@/lib/types';
import { AnalyticsService } from '@/lib/analytics-service';
import { formatCurrency, CURRENCY_SYMBOL } from '@/lib/currency';

interface AnalyticsDashboardProps {
  restaurantId: string;
}

export function AnalyticsDashboard({ restaurantId }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState<'revenue' | 'orders'>('revenue');

  useEffect(() => {
    if (restaurantId) {
      AnalyticsService.getRestaurantAnalytics(restaurantId).then((res) => {
        setData(res);
        setLoading(false);
      });
    }
  }, [restaurantId]);

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-28 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          <div className="h-28 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          <div className="h-28 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          <div className="h-28 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
          <div className="h-80 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  const maxDailyVal = Math.max(
    ...data.dailySales.map((d) => (chartMode === 'revenue' ? d.revenue : d.orders)),
    1
  );

  const maxMonthlyVal = Math.max(...data.monthlySales.map((m) => m.revenue), 1);

  return (
    <div className="space-y-6">
      {/* KPI Top Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-500">Gross Sales Revenue</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(data.totalRevenue)}
                </p>
              </div>
              <p className="text-[11px] text-zinc-500 font-semibold flex items-center gap-1 mt-0.5">
                <span>{data.totalOrders > 0 ? `${data.totalOrders} orders processed` : 'Awaiting dine-in sales'}</span>
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center font-black text-lg">
              {CURRENCY_SYMBOL}
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-500">Total Dine &amp; QR Orders</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  {data.totalOrders.toLocaleString()}
                </p>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">Contactless QR orders</p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-500">Average Order Value (AOV)</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(data.averageOrderValue)}
                </p>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">Per dining table ticket</p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Guest Rating */}
        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-500">Customer Satisfaction</p>
              <div className="flex items-center gap-1.5 mt-1">
                <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                  {data.averageRating.toFixed(1)}
                </p>
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                From {data.totalReviews} guest reviews
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Star className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Bar Chart */}
        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-card flex flex-col justify-between">
          <CardHeader className="p-5 sm:p-6 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Daily Sales Trend (Last 7 Days)
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500 mt-0.5">
                  Revenue and volume breakdown per day
                </CardDescription>
              </div>

              <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setChartMode('revenue')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    chartMode === 'revenue'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  Revenue ($)
                </button>
                <button
                  onClick={() => setChartMode('orders')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    chartMode === 'orders'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  Orders
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 pt-6">
            {/* Responsive Bar Chart Canvas */}
            <div className="h-56 flex items-end gap-2 sm:gap-4 pt-6 pb-2">
              {data.dailySales.map((item, idx) => {
                const currentVal = chartMode === 'revenue' ? item.revenue : item.orders;
                const heightPct = Math.max(12, Math.round((currentVal / maxDailyVal) * 100));
                const isToday = idx === data.dailySales.length - 1;

                return (
                  <div key={item.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white text-[10px] py-1 px-1.5 rounded font-mono pointer-events-none mb-1 text-center whitespace-nowrap shadow-md">
                      {chartMode === 'revenue' ? formatCurrency(item.revenue) : `${item.orders} orders`}
                    </div>

                    {/* Bar */}
                    <div
                      className={`w-full max-w-[42px] rounded-t-xl transition-all duration-500 relative ${
                        isToday
                          ? 'bg-brand-600 hover:bg-brand-500 shadow-sm'
                          : 'bg-zinc-200 dark:bg-zinc-800 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-700'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />

                    {/* X-Axis Label */}
                    <span className={`text-[10px] truncate max-w-full text-center ${
                      isToday ? 'font-black text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'
                    }`}>
                      {item.label.split(',')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue Area / Trend Chart */}
        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-card flex flex-col justify-between">
          <CardHeader className="p-5 sm:p-6 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Monthly Revenue Trajectory
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500 mt-0.5">
                  Consistent sales growth over the last 6 months
                </CardDescription>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#eef4f0] text-[#1b3b2f] border border-[#d2ded6]">
                6-Month Overview
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 pt-6">
            <div className="space-y-3">
              {data.monthlySales.map((item, idx) => {
                const pct = Math.round((item.revenue / maxMonthlyVal) * 100);
                const isCurrentMonth = idx === data.monthlySales.length - 1;

                return (
                  <div key={item.month} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className={isCurrentMonth ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-zinc-700 dark:text-zinc-300'}>
                        {item.label} 2026 {isCurrentMonth && '(Current)'}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-400 text-[11px] font-normal font-mono">{item.orders} orders</span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">{formatCurrency(item.revenue)}</span>
                      </div>
                    </div>

                    <div className="h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCurrentMonth
                            ? 'bg-gradient-to-r from-brand-600 to-emerald-500'
                            : 'bg-zinc-300 dark:bg-zinc-700'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Dishes & Peak Dining Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Dishes Leaderboard (2 Cols) */}
        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-card lg:col-span-2">
          <CardHeader className="p-5 sm:p-6 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Top-Selling Menu Items
                </CardTitle>
              </div>
              <span className="text-xs text-zinc-400">By sales volume</span>
            </div>
            <CardDescription className="text-xs text-zinc-500 mt-0.5">
              Your most profitable and ordered dishes on the digital QR menu
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 pt-4">
            {data.popularDishes.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                <Utensils className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">No Item Sales Recorded Yet</p>
                <p className="text-zinc-400 mt-1 max-w-xs mx-auto">
                  Dishes ordered by guests via QR menu will rank here by popularity and gross revenue.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden">
                {data.popularDishes.map((dish, rank) => (
                  <div
                    key={dish.id}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs bg-white dark:bg-zinc-900"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Rank Badge */}
                      <span className={`w-6 h-6 rounded-lg font-black text-[11px] flex items-center justify-center shrink-0 ${
                        rank === 0
                          ? 'bg-amber-400 text-amber-950 shadow-sm'
                          : rank === 1
                          ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                          : rank === 2
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          : 'text-zinc-400'
                      }`}>
                        #{rank + 1}
                      </span>

                      {/* Dish Image */}
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                        {dish.image ? (
                          <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                        ) : (
                          <Utensils className="w-4 h-4 m-auto text-zinc-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                          {dish.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-400">
                          <span>{dish.totalQuantity} orders placed</span>
                          <span>&bull;</span>
                          <span className="text-emerald-600 font-semibold">{dish.percentageOfSales}% of menu sales</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-sm text-zinc-900 dark:text-zinc-100 block font-mono">
                        {formatCurrency(dish.totalRevenue)}
                      </span>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Gross Rev</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Peak Dining Hours Card (1 Col) */}
        <Card className="border-zinc-200/80 dark:border-zinc-800 shadow-card flex flex-col justify-between">
          <CardHeader className="p-5 sm:p-6 pb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Peak Dining Hours
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-zinc-500 mt-0.5">
              When diners order the most from tables
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 pt-4 space-y-4">
            {data.peakHours.map((slot) => {
              const maxSlot = Math.max(...data.peakHours.map((s) => s.orders), 1);
              const pct = Math.round((slot.orders / maxSlot) * 100);

              return (
                <div key={slot.hour} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-zinc-700 dark:text-zinc-300">{slot.label}</span>
                    <span className="font-mono text-zinc-900 dark:text-zinc-100">{slot.orders} orders</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <span className="font-bold block">💡 Kitchen Service Velocity:</span>
              <p className="leading-relaxed text-[11px]">
                {data.totalOrders > 0
                  ? `Peak dining load reflects ${data.totalOrders} live customer orders placed via QR codes.`
                  : 'As guest table tickets arrive, your peak dining windows will be mapped automatically.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
