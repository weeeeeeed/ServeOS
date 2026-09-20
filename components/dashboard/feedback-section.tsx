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
import { BotanicalLeafBranch, HandwrittenNote } from '@/components/ui/botanical-decorations';

interface FeedbackSectionProps {
  restaurantId: string;
}

export function FeedbackSection({ restaurantId }: FeedbackSectionProps) {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({
    averageRating: 0.0,
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
    if (stats.totalReviews === 0) return 0;
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
        <div className="bg-white/95 border border-[#e6e2da] rounded-3xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-[#556960]">
              Overall Dining Rating
            </span>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-4xl lg:text-5xl font-serif font-bold text-[#1b3b2f]">
                {stats.totalReviews > 0 ? stats.averageRating.toFixed(1) : '—'}
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-[#d4af37]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        stats.totalReviews > 0 && s <= Math.round(stats.averageRating)
                          ? 'fill-[#d4af37] text-[#d4af37]'
                          : 'text-[#dcd7ce]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-[#85988e] mt-1 font-sans">
                  {stats.totalReviews > 0 ? `From ${stats.totalReviews} verified diners` : 'No reviews yet'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#f0ede6] flex items-center gap-2 text-xs font-semibold text-[#3a7d5c]">
            <Sparkles className="w-4 h-4" />
            <span>{stats.totalReviews > 0 ? 'Hospitality Excellence' : 'Awaiting First Guest Review'}</span>
          </div>
        </div>

        {/* 5-Star Ratio Card */}
        <div className="bg-white/95 border border-[#e6e2da] rounded-3xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-[#556960]">
              Five-Star Guest Delight
            </span>
            <div className="mt-3">
              <div className="text-3xl font-serif font-bold text-[#1b3b2f]">
                {stats.totalReviews > 0 ? `${fiveStarPercentage}%` : '—'}
              </div>
              <p className="text-xs text-[#556960] mt-1">
                {stats.totalReviews > 0
                  ? `${stats.ratingDistribution[5]} out of ${stats.totalReviews} diners rated 5 stars.`
                  : 'Guests can leave ratings after placing their order.'}
              </p>
            </div>
          </div>
          <div className="w-full bg-[#f4f1eb] h-2 rounded-full overflow-hidden mt-4">
            <div
              className="bg-[#3a7d5c] h-full rounded-full transition-all duration-500"
              style={{ width: `${fiveStarPercentage}%` }}
            />
          </div>
        </div>

        {/* Recent Sentiment Card */}
        <div className="bg-white/95 border border-[#e6e2da] rounded-3xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-[#556960]">
              Culinary Sentiment
            </span>
            <div className="mt-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#eef4f0] text-[#1b3b2f] flex items-center justify-center border border-[#d2ded6]">
                <Heart className="w-6 h-6 text-[#3a7d5c] fill-[#3a7d5c]/20" />
              </div>
              <div>
                <p className="font-serif font-bold text-base text-[#1b3b2f]">
                  {stats.totalReviews > 0 ? 'Guest Culinary Feedback' : 'Awaiting Reviews'}
                </p>
                <p className="text-xs text-[#556960]">
                  {stats.totalReviews > 0
                    ? 'Latest feedback from your dining patrons'
                    : 'Ratings submitted via digital menu will appear here in real time.'}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#f0ede6] flex items-center justify-between text-xs text-[#85988e]">
            <span>Real-time Guest QR Feedback</span>
            <span className="font-semibold text-[#1b3b2f]">Live Synced</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Rating Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#f4f1eb] text-xs font-semibold text-[#556960] overflow-x-auto">
          <button
            onClick={() => setSelectedRatingFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              selectedRatingFilter === 'all'
                ? 'bg-[#1b3b2f] text-white font-bold shadow-xs'
                : 'hover:text-[#1b3b2f] hover:bg-white/60'
            }`}
            type="button"
          >
            All Reviews ({stats.totalReviews})
          </button>
          {[5, 4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRatingFilter(r)}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 whitespace-nowrap ${
                selectedRatingFilter === r
                  ? 'bg-[#1b3b2f] text-white font-bold shadow-xs'
                  : 'hover:text-[#1b3b2f] hover:bg-white/60'
              }`}
              type="button"
            >
              <span>{r}</span>
              <Star className="w-3 h-3 fill-[#d4af37] text-[#d4af37]" />
              <span className="text-[10px] opacity-80">({stats.ratingDistribution[r as 1 | 2 | 3 | 4 | 5] || 0})</span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#85988e] pointer-events-none" />
          <input
            type="text"
            placeholder="Search reviews or guests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] placeholder-[#85988e] focus:outline-none focus:ring-2 focus:ring-[#3a7d5c] shadow-2xs"
          />
        </div>
      </div>

      {/* Feedback Cards List */}
      {filteredFeedback.length === 0 ? (
        <div className="bg-white/90 rounded-3xl p-12 text-center border border-[#e6e2da] shadow-2xs space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#eef4f0] text-[#1b3b2f] flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-[#3a7d5c]" />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#1b3b2f]">No Reviews in this Filter</h3>
          <p className="text-xs text-[#556960] max-w-xs mx-auto">
            Guest reviews submitted at the end of their QR menu meal will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFeedback.map((fb) => (
            <div
              key={fb.id}
              className="bg-white/95 rounded-3xl p-5 border border-[#e6e2da] shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#eef4f0] text-[#1b3b2f] font-serif font-bold text-sm flex items-center justify-center border border-[#d2ded6]">
                      {fb.customer_name ? fb.customer_name.slice(0, 2).toUpperCase() : 'G'}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#1b3b2f]">
                        {fb.customer_name || 'Anonymous Guest'}
                      </h4>
                      <p className="text-[11px] text-[#85988e] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatElapsed(fb.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= fb.rating
                            ? 'fill-[#d4af37] text-[#d4af37]'
                            : 'text-[#dcd7ce]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {fb.comment ? (
                  <p className="text-xs text-[#556960] mt-3 leading-relaxed">
                    &quot;{fb.comment}&quot;
                  </p>
                ) : (
                  <p className="text-xs text-[#85988e] mt-3 italic">
                    Rating submitted without written comment.
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#f0ede6] flex items-center justify-between text-[11px] text-[#85988e]">
                <span>Verified QR Table Order</span>
                <span className="text-[#3a7d5c] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Published
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
