'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Store,
  MapPin,
  Phone,
  Clock,
  QrCode,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  Utensils,
  Search,
  AlertCircle,
  ShieldCheck,
  Leaf,
  X,
  Share2,
  ExternalLink,
  ChevronRight,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ChefHat,
  Bell,
  ArrowRight,
  Star,
  MessageSquare,
  Heart,
  Send,
} from 'lucide-react';
import { AuthService } from '@/lib/auth-service';
import { MenuService } from '@/lib/menu-service';
import { OrderService } from '@/lib/order-service';
import { FeedbackService } from '@/lib/feedback-service';
import { Restaurant, Category, MenuItem, DietaryType, CartItem, OrderWithItems, Feedback } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';

// Standard Culinary Veg/Non-Veg/Vegan Indicator Symbol
function DietarySymbol({ type }: { type?: DietaryType | boolean }) {
  let effectiveType: DietaryType = 'non-veg';
  if (typeof type === 'boolean') {
    effectiveType = type ? 'veg' : 'non-veg';
  } else if (type) {
    effectiveType = type;
  }

  if (effectiveType === 'vegan') {
    return (
      <span
        title="100% Vegan"
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0"
      >
        <Leaf className="w-2.5 h-2.5 text-emerald-600" />
        <span>VEGAN</span>
      </span>
    );
  }

  if (effectiveType === 'veg') {
    return (
      <span
        title="Vegetarian"
        className="w-4 h-4 rounded border-2 border-emerald-600 flex items-center justify-center bg-white dark:bg-zinc-900 shrink-0"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-600" />
      </span>
    );
  }

  return (
    <span
      title="Non-Vegetarian"
      className="w-4 h-4 rounded border-2 border-rose-600 flex items-center justify-center bg-white dark:bg-zinc-900 shrink-0"
    >
      <span className="w-2 h-2 rounded-full bg-rose-600" />
    </span>
  );
}

function CustomerMenuFallback() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <Skeleton className="h-24 w-24 rounded-2xl mx-auto" />
        <Skeleton className="h-7 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
        <div className="space-y-3 pt-6">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function PublicCustomerMenuContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const tableParam = searchParams.get('table');
  const toast = useToast();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg' | 'vegan'>('all');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState(tableParam ? `Table ${tableParam}` : 'Table 4');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Active placed order tracking state
  const [activeOrder, setActiveOrder] = useState<OrderWithItems | null>(null);

  // Feedback State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Load restaurant & menu
  useEffect(() => {
    if (slug) {
      AuthService.getRestaurantBySlug(slug).then(async (res) => {
        setRestaurant(res);
        if (res?.id) {
          const [cats, items] = await Promise.all([
            MenuService.getCategories(res.id),
            MenuService.getMenuItems(res.id),
          ]);
          setCategories(cats);
          setMenuItems(items);
        }
        setLoading(false);
      });
    }
  }, [slug]);

  // Subscribe to live status updates of placed order
  useEffect(() => {
    if (!activeOrder?.id) return;

    const unsubscribe = OrderService.subscribeToSingleOrder(activeOrder.id, (updated) => {
      setActiveOrder(updated);
      if (updated.status === 'ready') {
        toast.info('Dishes Ready! 🛎️', `Your food is on its way to ${updated.table_number}!`);
      } else if (updated.status === 'completed') {
        toast.success('Order Completed ✅', 'Enjoy your delicious meal!');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeOrder?.id, toast]);

  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c.name]));
  }, [categories]);

  // Cart helper functions
  const cartItemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (total, item) => total + Number(item.menuItem.price) * item.quantity,
      0
    );
  }, [cart]);

  const handleAddToCart = (item: MenuItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!item.available) return;

    setCart((prev) => {
      const idx = prev.findIndex((c) => c.menuItem.id === item.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx].quantity += 1;
        return copy;
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });

    toast.success('Added to Cart', `${item.name} ($${Number(item.price).toFixed(2)})`);
  };

  const handleDecreaseQuantity = (itemId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.menuItem.id === itemId);
      if (idx === -1) return prev;
      if (prev[idx].quantity <= 1) {
        return prev.filter((c) => c.menuItem.id !== itemId);
      }
      const copy = [...prev];
      copy[idx].quantity -= 1;
      return copy;
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant?.id) return;
    if (!tableNumber.trim()) {
      setOrderError('Please enter your table number');
      return;
    }
    if (cart.length === 0) {
      setOrderError('Your cart is empty');
      return;
    }

    setIsPlacingOrder(true);
    setOrderError(null);

    try {
      const placed = await OrderService.createOrder({
        restaurantId: restaurant.id,
        tableNumber: tableNumber.trim(),
        customerNotes: customerNotes.trim(),
        items: cart,
      });

      setActiveOrder(placed);
      setCart([]);
      setIsCartOpen(false);
      setFeedbackSubmitted(false);
      toast.success('Order Sent to Kitchen! 🍳', `${tableNumber} - #${placed.id.slice(-6)}`);
    } catch (err: any) {
      setOrderError(err?.message || 'Failed to place order. Please try again.');
      toast.error('Order Failed', err?.message || 'Please check your connection');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant?.id) return;

    setIsSubmittingFeedback(true);
    try {
      await FeedbackService.submitFeedback({
        restaurantId: restaurant.id,
        orderId: activeOrder?.id || null,
        rating,
        comment: feedbackComment.trim() || undefined,
        customerName: customerName.trim() || activeOrder?.table_number || 'Diner',
      });
      setFeedbackSubmitted(true);
      toast.success('Feedback Received! ⭐', `Thank you for rating us ${rating} stars!`);
    } catch (err: any) {
      console.error('Failed to submit feedback:', err);
      toast.error('Feedback Error', err?.message || 'Could not submit review');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategoryId === 'all' || item.category_id === selectedCategoryId;

      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesDietary = true;
      const itemDietary = item.dietary_type || (item.is_veg ? 'veg' : 'non-veg');
      if (dietaryFilter === 'veg') {
        matchesDietary = itemDietary === 'veg' || itemDietary === 'vegan';
      } else if (dietaryFilter === 'vegan') {
        matchesDietary = itemDietary === 'vegan';
      } else if (dietaryFilter === 'non-veg') {
        matchesDietary = itemDietary === 'non-veg';
      }

      const matchesAvailability = !showOnlyAvailable || item.available;

      return matchesCategory && matchesSearch && matchesDietary && matchesAvailability;
    });
  }, [menuItems, selectedCategoryId, searchQuery, dietaryFilter, showOnlyAvailable]);

  // Group items by category
  const groupedItems = useMemo(() => {
    if (selectedCategoryId !== 'all') {
      const catName = categoryMap.get(selectedCategoryId) || 'Items';
      return [{ categoryId: selectedCategoryId, categoryName: catName, items: filteredItems }];
    }

    const groups: { categoryId: string; categoryName: string; items: MenuItem[] }[] = [];
    categories.forEach((cat) => {
      const itemsInCat = filteredItems.filter((i) => i.category_id === cat.id);
      if (itemsInCat.length > 0) {
        groups.push({
          categoryId: cat.id,
          categoryName: cat.name,
          items: itemsInCat,
        });
      }
    });

    const otherItems = filteredItems.filter((i) => !categoryMap.has(i.category_id));
    if (otherItems.length > 0) {
      groups.push({
        categoryId: 'other',
        categoryName: 'Chef Specials',
        items: otherItems,
      });
    }

    return groups;
  }, [categories, categoryMap, filteredItems, selectedCategoryId]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: restaurant?.name || 'Restaurant Menu',
          url: window.location.href,
        }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        toast.info('Menu Link Copied! 📋', 'Direct dining URL copied to clipboard');
      }
    }
  };

  if (loading) {
    return <CustomerMenuFallback />;
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 flex flex-col items-center justify-center text-center">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-card space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Restaurant Menu Not Found</h1>
          <p className="text-xs text-zinc-500 leading-relaxed">
            No active dining establishment found at <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-xs font-mono">/r/{slug}</code>.
          </p>
          <div className="pt-2">
            <Link href="/">
              <Button variant="primary" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Return to RestoQR Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col antialiased selection:bg-brand-500 selection:text-white pb-24">
      {/* Top Mobile-First Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center shadow-subtle shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                {restaurant.name}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Order from Table
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeOrder && (
              <button
                onClick={() => {}}
                className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800 flex items-center gap-1.5"
              >
                <ChefHat className="w-3.5 h-3.5 animate-bounce" />
                <span>Order Active</span>
              </button>
            )}

            <button
              onClick={handleShare}
              aria-label="Share Menu Link"
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-xs font-medium flex items-center gap-1.5"
              title="Share Menu"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto w-full px-3 sm:px-4 py-4 space-y-4 flex-1">
        {/* Active Order Live Tracker Banner & Feedback Widget */}
        {activeOrder && (
          <div className="bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 text-white rounded-3xl p-5 shadow-elevated border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                <h3 className="font-extrabold text-sm tracking-tight text-white">
                  Live Table Order Tracker
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {activeOrder.table_number.toUpperCase()} &bull; #{activeOrder.id.slice(-6)}
              </span>
            </div>

            {/* Status Steps Progress */}
            <div className="grid grid-cols-4 gap-2 text-center pt-1">
              <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                activeOrder.status === 'pending'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                  : 'bg-zinc-800/40 border-zinc-700 text-zinc-400'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="text-[10px] uppercase">1. Received</span>
              </div>

              <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                activeOrder.status === 'preparing'
                  ? 'bg-blue-500/20 border-blue-400 text-blue-300 font-bold'
                  : activeOrder.status === 'ready' || activeOrder.status === 'completed'
                  ? 'bg-zinc-800/40 border-zinc-700 text-emerald-400'
                  : 'bg-zinc-800/40 border-zinc-700 text-zinc-400'
              }`}>
                <ChefHat className="w-4 h-4" />
                <span className="text-[10px] uppercase">2. Cooking</span>
              </div>

              <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                activeOrder.status === 'ready'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold animate-pulse'
                  : activeOrder.status === 'completed'
                  ? 'bg-zinc-800/40 border-zinc-700 text-emerald-400'
                  : 'bg-zinc-800/40 border-zinc-700 text-zinc-400'
              }`}>
                <Bell className="w-4 h-4" />
                <span className="text-[10px] uppercase">3. Ready</span>
              </div>

              <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 ${
                activeOrder.status === 'completed'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-zinc-800/40 border-zinc-700 text-zinc-400'
              }`}>
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] uppercase">4. Served</span>
              </div>
            </div>

            <div className="p-3 bg-zinc-800/60 rounded-xl text-xs flex items-center justify-between text-zinc-300">
              <span>
                {activeOrder.status === 'pending' && '⏳ Kitchen received your order and will begin cooking shortly.'}
                {activeOrder.status === 'preparing' && '🍳 Your dishes are currently sizzling in the kitchen!'}
                {activeOrder.status === 'ready' && '🛎️ Dishes are ready and being brought to your table!'}
                {activeOrder.status === 'completed' && '✅ Order completed! Enjoy your delicious meal.'}
                {activeOrder.status === 'cancelled' && '✕ Order was cancelled.'}
              </span>
              <span className="font-bold text-white pl-2 shrink-0 font-mono">
                ${Number(activeOrder.total_amount).toFixed(2)}
              </span>
            </div>

            {/* Embedded Diner Feedback Rating Flow */}
            <div className="pt-3 border-t border-zinc-800/80">
              {feedbackSubmitted ? (
                <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-700/60 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Thank you for your rating!</span>
                  </div>
                  <div className="flex justify-center text-amber-400 text-xs">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'fill-amber-400' : 'text-zinc-600'}`} />
                    ))}
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    Your feedback helps the culinary team at {restaurant.name} improve your experience.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="bg-zinc-800/50 p-3.5 rounded-2xl border border-zinc-750 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>Rate Your Experience</span>
                    </span>
                    <span className="text-[10px] text-zinc-400">1 to 5 Stars</span>
                  </div>

                  {/* Star Rating Selector */}
                  <div className="flex items-center justify-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const isHighlighted = (hoverRating || rating) >= starVal;
                      return (
                        <button
                          key={starVal}
                          type="button"
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(starVal)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              isHighlighted
                                ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                                : 'text-zinc-600 hover:text-amber-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Comment Input */}
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      placeholder="Write a quick review about the food, ambiance, or service (optional)..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-400"
                    />

                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder="Your Name (optional)"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
                      />

                      <Button
                        type="submit"
                        size="sm"
                        isLoading={isSubmittingFeedback}
                        className="text-xs h-8 px-3 gap-1 bg-amber-500 hover:bg-amber-600 text-white font-bold"
                      >
                        <Send className="w-3 h-3" />
                        <span>Submit</span>
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Restaurant Hero Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-card relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 text-white flex items-center justify-center font-bold text-3xl shadow-elevated border-2 border-white dark:border-zinc-800 overflow-hidden shrink-0">
              {restaurant.logo ? (
                <img
                  src={restaurant.logo}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{restaurant.name.charAt(0)}</span>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                  {restaurant.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Menu</span>
                </span>
              </div>

              {restaurant.description && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {restaurant.description}
                </p>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-zinc-500">
                {restaurant.opening_hours && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px]">
                    <Clock className="w-3 h-3 text-brand-500" />
                    <span>{restaurant.opening_hours}</span>
                  </div>
                )}

                {restaurant.address && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 text-[11px]"
                  >
                    <MapPin className="w-3 h-3 text-zinc-400" />
                    <span className="truncate max-w-[170px]">{restaurant.address}</span>
                  </a>
                )}

                {restaurant.phone && (
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 text-[11px]"
                  >
                    <Phone className="w-3 h-3 text-zinc-400" />
                    <span>{restaurant.phone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search & Dietary Filters Container */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-3.5 shadow-card space-y-3 sticky top-[57px] z-30">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search dishes, drinks, or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Navigation Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                selectedCategoryId === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
              }`}
            >
              <span>All Dishes</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategoryId === 'all'
                  ? 'bg-zinc-700 text-zinc-100 dark:bg-zinc-300 dark:text-zinc-900'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
              }`}>
                {menuItems.length}
              </span>
            </button>

            {categories.map((cat) => {
              const count = menuItems.filter((i) => i.category_id === cat.id).length;
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-zinc-700 text-zinc-100 dark:bg-zinc-300 dark:text-zinc-900'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dietary Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            <span className="text-[11px] font-bold text-zinc-400 shrink-0 uppercase tracking-wider">
              Diet:
            </span>

            <button
              onClick={() => setDietaryFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                dietaryFilter === 'all'
                  ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 hover:text-zinc-800'
              }`}
            >
              All
            </button>

            <button
              onClick={() => setDietaryFilter(dietaryFilter === 'veg' ? 'all' : 'veg')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                dietaryFilter === 'veg'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Veg Only</span>
            </button>

            <button
              onClick={() => setDietaryFilter(dietaryFilter === 'non-veg' ? 'all' : 'non-veg')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                dietaryFilter === 'non-veg'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>Non-Veg</span>
            </button>

            <button
              onClick={() => setDietaryFilter(dietaryFilter === 'vegan' ? 'all' : 'vegan')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                dietaryFilter === 'vegan'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              <Leaf className="w-3 h-3 text-emerald-500" />
              <span>Vegan</span>
            </button>
          </div>
        </div>

        {/* Menu Items Feed */}
        {filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-card space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              No Dishes Found
            </h3>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              No dishes match your selected filter.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedItems.map((group) => (
              <section key={group.categoryId} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {group.categoryName}
                  </h2>
                  <span className="text-xs text-zinc-400 font-medium">
                    {group.items.length} {group.items.length === 1 ? 'dish' : 'dishes'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {group.items.map((item) => {
                    const cartEntry = cart.find((c) => c.menuItem.id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItemForModal(item)}
                        className={`group bg-white dark:bg-zinc-900 border rounded-2xl p-3.5 shadow-card hover:shadow-elevated transition-all cursor-pointer flex gap-3.5 justify-between relative overflow-hidden select-none ${
                          item.available
                            ? 'border-zinc-200/80 dark:border-zinc-800 active:scale-[0.99]'
                            : 'border-zinc-200/60 dark:border-zinc-800/60 opacity-60 bg-zinc-50/50 dark:bg-zinc-900/50'
                        }`}
                      >
                        {/* Left Details */}
                        <div className="flex-1 flex flex-col justify-between min-w-0 space-y-1">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <DietarySymbol type={item.dietary_type || (item.is_veg ? 'veg' : 'non-veg')} />
                              {item.available ? (
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                                  Popular
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded">
                                  Sold Out
                                </span>
                              )}
                            </div>

                            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                              {item.name}
                            </h3>

                            {item.description && (
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>

                          {/* Price & Add to Cart Stepper */}
                          <div className="pt-2 flex items-center justify-between">
                            <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                              ${Number(item.price).toFixed(2)}
                            </span>

                            {item.available && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center"
                              >
                                {cartEntry ? (
                                  <div className="flex items-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl p-0.5 shadow-sm">
                                    <button
                                      onClick={(e) => handleDecreaseQuantity(item.id, e)}
                                      className="p-1 hover:bg-zinc-700 dark:hover:bg-zinc-300 rounded-lg transition-colors"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-xs font-black px-2 select-none">
                                      {cartEntry.quantity}
                                    </span>
                                    <button
                                      onClick={(e) => handleAddToCart(item, e)}
                                      className="p-1 hover:bg-zinc-700 dark:hover:bg-zinc-300 rounded-lg transition-colors"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={(e) => handleAddToCart(item, e)}
                                    className="px-3 py-1 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Add</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Food Image Thumbnail */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 overflow-hidden relative shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                                !item.available ? 'grayscale opacity-75' : ''
                              }`}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                              <Utensils className="w-7 h-7" />
                            </div>
                          )}

                          {!item.available && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center text-[10px] font-extrabold text-white uppercase tracking-wider text-center p-1">
                              Sold Out
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      {cartItemCount > 0 && (
        <aside aria-label="Dining Cart" className="fixed bottom-4 left-4 right-4 z-40 max-w-2xl mx-auto animate-in slide-in-from-bottom-5 duration-200">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-4 rounded-2xl shadow-elevated flex items-center justify-between hover:bg-zinc-850 dark:hover:bg-zinc-200 transition-all font-bold group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center text-xs font-black shadow-sm">
                {cartItemCount}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm tracking-tight leading-none">View Cart</span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-0.5">
                  {cart.length} {cart.length === 1 ? 'dish' : 'dishes'} selected
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-base font-black">
                ${cartTotal.toFixed(2)}
              </span>
              <div className="w-7 h-7 rounded-lg bg-zinc-800 dark:bg-zinc-200 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        </aside>
      )}

      {/* Slide-Over Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-elevated overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-600" />
                <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                  Your Table Order Cart
                </h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                aria-label="Close cart"
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-5 space-y-5">
              {orderError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{orderError}</span>
                </div>
              )}

              {/* Table Number Selector */}
              <div className="p-4 bg-brand-50/60 dark:bg-brand-950/20 border border-brand-200/80 dark:border-brand-900/40 rounded-2xl space-y-2">
                <label className="block text-xs font-extrabold text-brand-950 dark:text-brand-200 uppercase tracking-wider">
                  Dining Table Number *
                </label>
                <Input
                  placeholder="e.g. Table 4, Bar 2, Patio 10"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="bg-white dark:bg-zinc-900 font-bold text-sm"
                  required
                />
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                  Enter the number printed on your table stand for accurate delivery.
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Order Dishes ({cartItemCount})
                </h3>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                  {cart.map((cartItem) => (
                    <div
                      key={cartItem.menuItem.id}
                      className="p-3.5 flex items-center justify-between gap-3 text-xs bg-white dark:bg-zinc-900"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                          {cartItem.menuItem.image ? (
                            <img
                              src={cartItem.menuItem.image}
                              alt={cartItem.menuItem.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Utensils className="w-5 h-5 m-auto text-zinc-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 block truncate">
                            {cartItem.menuItem.name}
                          </span>
                          <span className="text-[11px] text-zinc-400">
                            ${Number(cartItem.menuItem.price).toFixed(2)} each
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-xl p-0.5">
                          <button
                            type="button"
                            onClick={() => handleDecreaseQuantity(cartItem.menuItem.id)}
                            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black px-2">
                            {cartItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddToCart(cartItem.menuItem)}
                            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-extrabold text-zinc-900 dark:text-zinc-100 w-16 text-right font-mono">
                          ${(Number(cartItem.menuItem.price) * cartItem.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Cooking Instructions */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Special Cooking Instructions & Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please no onions, extra spicy, dressing on the side..."
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              {/* Bill Summary */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Service & Tax</span>
                  <span className="font-mono text-emerald-600 font-semibold">Included</span>
                </div>
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-between font-black text-sm text-zinc-900 dark:text-zinc-100">
                  <span>Total Order Amount</span>
                  <span className="font-mono">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                isLoading={isPlacingOrder}
                className="w-full gap-2 font-black shadow-elevated h-12"
              >
                <span>Send Order to Kitchen</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Dish Detail Bottom Sheet Modal */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-elevated overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-60 sm:h-72 w-full bg-zinc-100 dark:bg-zinc-800 shrink-0">
              {selectedItemForModal.image ? (
                <img
                  src={selectedItemForModal.image}
                  alt={selectedItemForModal.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                  <Utensils className="w-12 h-12" />
                </div>
              )}

              <button
                onClick={() => setSelectedItemForModal(null)}
                aria-label="Close dish details"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur text-white flex items-center justify-center hover:bg-black/80 transition-colors shadow-md"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 right-4 bg-zinc-950/90 backdrop-blur text-white px-3.5 py-1.5 rounded-xl text-base font-black shadow-lg">
                ${Number(selectedItemForModal.price).toFixed(2)}
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <DietarySymbol type={selectedItemForModal.dietary_type || (selectedItemForModal.is_veg ? 'veg' : 'non-veg')} />
                  <span className="text-xs font-semibold text-zinc-500">
                    {categoryMap.get(selectedItemForModal.category_id) || 'Specialty Dish'}
                  </span>
                  {selectedItemForModal.available ? (
                    <span className="ml-auto text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      🟢 Available
                    </span>
                  ) : (
                    <span className="ml-auto text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      🔴 Sold Out
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  {selectedItemForModal.name}
                </h2>
              </div>

              {selectedItemForModal.description && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Ingredients & Preparation
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {selectedItemForModal.description}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-950/80 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-zinc-400 block">Price</span>
                <span className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                  ${Number(selectedItemForModal.price).toFixed(2)}
                </span>
              </div>

              {selectedItemForModal.available && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    handleAddToCart(selectedItemForModal);
                    setSelectedItemForModal(null);
                  }}
                  className="gap-2 font-bold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Table Order</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-zinc-400 dark:text-zinc-600 border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
        Powered by RestoQR Platform &bull; Contactless Dining Ordering System
      </footer>
    </div>
  );
}

export default function PublicCustomerMenuPage() {
  return (
    <Suspense fallback={<CustomerMenuFallback />}>
      <PublicCustomerMenuContent />
    </Suspense>
  );
}
