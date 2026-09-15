'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  User,
  Heart,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Feedback, FeedbackStats } from '@/lib/types';
import { FeedbackService } from '@/lib/feedback-service';

interface FeedbackSectionProps {
  restaurantId: string;
}

export function FeedbackSection({ restaurantId }: FeedbackSectionProps) {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({
    averageRating: 5.0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadFeedbackData = async () => {
    if (!restaurantId) return;
    try {
      const [list, st] = await Promise.all([
        FeedbackService.getRestaurantFeedback(restaurantId),
        FeedbackService.getFeedbackStats(restaurantId),
      ]);
      setFeedbackList(list);
      setStats(st);
    } catch (err) {
      console.error('Failed to load feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbackData();
    const unsubscribe = FeedbackService.subscribeToFeedback(restaurantId, () => {
      loadFeedbackData();
    });
    return () => {
      unsubscribe();
    };
  }, [restaurantId]);

  const filteredFeedback = useMemo(() => {
    return feedbackList.filter((fb) => {
      const matchesRating =
        selectedRatingFilter === 'all' || fb.rating === selectedRatingFilter;
      const matchesSearch =
        !searchQuery ||
        (fb.comment && fb.comment.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (fb.customer_name && fb.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (fb.order_id && fb.order_id.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesRating && matchesSearch;
    });
  }, [feedbackList, selectedRatingFilter, searchQuery]);

  const fiveStarPercentage = useMemo(() => {
    if (stats.totalReviews === 0) return 100;
    return Math.round((stats.ratingDistribution[5] / stats.totalReviews) * 100);
  }, [stats]);

  const formatElapsed = (isoDate: string) => {
    const elapsedMs = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(elapsedMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Top Rating Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Overall Score Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-card flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Overall Guest Rating
            </span>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-4xl font-black text-zinc-900 dark:text-zinc-100">
                {stats.averageRating.toFixed(1)}
              </span>
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${
                      s <= Math.round(stats.averageRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-200 dark:text-zinc-700'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Based on <span className="font-bold text-zinc-700 dark:text-zinc-300">{stats.totalReviews} verified reviews</span> from table QR diners
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{fiveStarPercentage}% 5-Star Reviews</span>
            </span>
            <button
              onClick={loadFeedbackData}
              className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-card md:col-span-2 flex flex-col justify-center space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
            Star Rating Distribution
          </h3>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.ratingDistribution[star as keyof typeof stats.ratingDistribution] || 0;
            const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <button
                  onClick={() => setSelectedRatingFilter(star)}
                  className="w-14 flex items-center gap-1 text-zinc-600 dark:text-zinc-400 font-semibold hover:text-zinc-900 shrink-0"
                >
                  <span>{star}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </button>

                <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <span className="w-10 text-right font-mono text-[11px] text-zinc-400 shrink-0">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <button
            onClick={() => setSelectedRatingFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedRatingFilter === 'all'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            All Reviews ({stats.totalReviews})
          </button>

          {[5, 4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRatingFilter(r)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                selectedRatingFilter === r
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
              }`}
            >
              <span>{r}</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search diner reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none"
          />
        </div>
      </div>

      {/* Reviews Feed */}
      {filteredFeedback.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            No Feedback Found
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {selectedRatingFilter !== 'all'
              ? `No ${selectedRatingFilter}-star reviews match your filter.`
              : 'Ratings and feedback submitted by diners after placing orders will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFeedback.map((fb) => (
            <div
              key={fb.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-card space-y-3 flex flex-col justify-between"
            >
              <div>
                {/* Header: Customer Name & Star Rating */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
                      {fb.customer_name ? fb.customer_name.charAt(0) : 'D'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                        {fb.customer_name || 'Anonymous Diner'}
                      </span>
                      <div className="flex items-center text-amber-400 mt-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= fb.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-zinc-200 dark:text-zinc-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatElapsed(fb.created_at)}</span>
                    </span>
                    {fb.order_id && (
                      <span className="text-[10px] text-brand-600 dark:text-brand-400 font-mono block mt-0.5">
                        #{fb.order_id.slice(-6)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Comment */}
                {fb.comment && (
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-3 leading-relaxed italic bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    &ldquo;{fb.comment}&rdquo;
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Table Order</span>
                </span>
                <span>{new Date(fb.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
