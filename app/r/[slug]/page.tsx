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
    <div className="min-h-screen bg-[#eae9e4] p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-4 bg-white p-6 rounded-[32px] border border-stone-200 shadow-board">
        <Skeleton className="h-24 w-24 rounded-2xl mx-auto bg-stone-200" />
        <Skeleton className="h-7 w-48 mx-auto bg-stone-200" />
        <Skeleton className="h-4 w-64 mx-auto bg-stone-100" />
        <div className="space-y-3 pt-6">
          <Skeleton className="h-28 w-full rounded-2xl bg-stone-100" />
          <Skeleton className="h-28 w-full rounded-2xl bg-stone-100" />
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
      <div className="min-h-screen bg-[#eae9e4] p-6 flex flex-col items-center justify-center text-center antialiased">
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-[32px] p-8 shadow-board space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Store className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-stone-900">Restaurant Menu Not Found</h1>
          <p className="text-xs text-stone-500 leading-relaxed">
            No active dining establishment found at <code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs font-mono">/r/{slug}</code>.
          </p>
          <div className="pt-2">
            <Link href="/">
              <Button size="sm" className="gap-2 bg-[#efa736] hover:bg-[#e09827] text-white font-bold rounded-xl shadow-sm">
                <ArrowLeft className="w-4 h-4" />
                <span>Return to BitePoint Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eae9e4] py-3 sm:py-6 px-2 sm:px-4 flex flex-col items-center antialiased selection:bg-[#efa736] selection:text-white pb-32">
      {/* Floating Mobile Board Shell */}
      <div className="w-full max-w-xl bg-[#faf9f6] rounded-[28px] sm:rounded-[36px] border border-stone-200/90 shadow-board overflow-hidden flex flex-col min-h-[92vh] relative">
        {/* Top Floating Mobile Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#1f4e47] text-[#efa736] flex items-center justify-center shadow-subtle shrink-0">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold tracking-tight text-stone-900 truncate">
                  {restaurant.name}
                </span>
                <span className="text-[10px] text-[#2f6858] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2f6858] animate-pulse" />
                  Table Dining Experience
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#efa736]" />
                <span>{tableNumber}</span>
              </span>

              {activeOrder && (
                <button
                  onClick={() => {}}
                  className="px-2.5 py-1 rounded-full bg-[#1f4e47] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <ChefHat className="w-3.5 h-3.5 animate-bounce text-[#efa736]" />
                  <span>Cooking</span>
                </button>
              )}

              <button
                onClick={handleShare}
                aria-label="Share Menu Link"
                className="p-2 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors text-xs font-medium flex items-center gap-1.5"
                title="Share Menu"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area inside Board */}
        <main className="w-full px-3 sm:px-4 py-4 space-y-4 flex-1">
        {/* Active Order Live Tracker Banner & Feedback Widget */}
        {activeOrder && (
          <div className="bg-[#1f4e47] text-white rounded-3xl p-5 shadow-elevated border border-[#133e36] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#efa736] animate-ping" />
                <h3 className="font-bold text-sm tracking-tight text-white">
                  Live Table Ticket Tracker
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-200 bg-[#133e36] px-2.5 py-0.5 rounded-full">
                {activeOrder.table_number.toUpperCase()} &bull; #{activeOrder.id.slice(-6)}
              </span>
            </div>

            {/* Status Steps Progress */}
            <div className="grid grid-cols-4 gap-2 text-center pt-1">
              <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                activeOrder.status === 'pending'
                  ? 'bg-[#efa736] border-[#efa736] text-stone-950 font-bold shadow-sm'
                  : 'bg-[#133e36]/60 border-[#2a6a61]/40 text-emerald-200'
              }`}>
                <Clock className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">1. Received</span>
              </div>

              <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                activeOrder.status === 'preparing'
                  ? 'bg-[#efa736] border-[#efa736] text-stone-950 font-bold shadow-sm'
                  : activeOrder.status === 'ready' || activeOrder.status === 'completed'
                  ? 'bg-[#133e36]/90 border-emerald-400/50 text-[#efa736]'
                  : 'bg-[#133e36]/60 border-[#2a6a61]/40 text-emerald-200'
              }`}>
                <ChefHat className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">2. Cooking</span>
              </div>

              <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                activeOrder.status === 'ready'
                  ? 'bg-[#efa736] border-[#efa736] text-stone-950 font-bold animate-pulse shadow-sm'
                  : activeOrder.status === 'completed'
                  ? 'bg-[#133e36]/90 border-emerald-400/50 text-[#efa736]'
                  : 'bg-[#133e36]/60 border-[#2a6a61]/40 text-emerald-200'
              }`}>
                <Bell className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">3. Ready</span>
              </div>

              <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                activeOrder.status === 'completed'
                  ? 'bg-[#efa736] border-[#efa736] text-stone-950 font-bold shadow-sm'
                  : 'bg-[#133e36]/60 border-[#2a6a61]/40 text-emerald-200'
              }`}>
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider">4. Served</span>
              </div>
            </div>

            <div className="p-3 bg-[#133e36]/80 rounded-xl text-xs flex items-center justify-between text-emerald-100 border border-[#2a6a61]/30">
              <span className="font-medium">
                {activeOrder.status === 'pending' && '⏳ Kitchen received your order and will begin cooking shortly.'}
                {activeOrder.status === 'preparing' && '🍳 Your dishes are sizzling on the kitchen pass!'}
                {activeOrder.status === 'ready' && '🛎️ Food is ready and being served to your table!'}
                {activeOrder.status === 'completed' && '✅ Order completed! Buon appetito.'}
                {activeOrder.status === 'cancelled' && '✕ Order was cancelled.'}
              </span>
              <span className="font-bold text-[#efa736] pl-2 shrink-0 tabular-nums text-sm">
                ${Number(activeOrder.total_amount).toFixed(2)}
              </span>
            </div>

            {/* Embedded Diner Feedback Rating Flow */}
            <div className="pt-3 border-t border-[#2a6a61]/40">
              {feedbackSubmitted ? (
                <div className="p-3.5 rounded-2xl bg-[#133e36] border border-emerald-500/40 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-300 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-[#efa736]" />
                    <span>Thank you for dining with us!</span>
                  </div>
                  <div className="flex justify-center text-[#efa736] text-xs pt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? 'fill-[#efa736]' : 'text-stone-600'}`} />
                    ))}
                  </div>
                  <p className="text-[11px] text-emerald-100">
                    Your feedback has been delivered directly to the kitchen team.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="bg-[#133e36]/70 p-3.5 rounded-2xl border border-[#2a6a61]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-[#efa736] fill-[#efa736]" />
                      <span>Rate Your Experience</span>
                    </span>
                    <span className="text-[10px] text-emerald-200">1 to 5 Stars</span>
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
                                ? 'fill-[#efa736] text-[#efa736] drop-shadow-sm'
                                : 'text-stone-500 hover:text-[#efa736]'
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
                      placeholder="Share a quick note about the flavors, presentation, or service (optional)..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#1f4e47] border border-[#2a6a61] rounded-xl text-white placeholder:text-emerald-200/60 focus:outline-none focus:ring-1 focus:ring-[#efa736]"
                    />

                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder="Your Name (optional)"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-[#1f4e47] border border-[#2a6a61] rounded-xl text-white placeholder:text-emerald-200/60 focus:outline-none focus:ring-1 focus:ring-[#efa736]"
                      />

                      <Button
                        type="submit"
                        size="sm"
                        isLoading={isSubmittingFeedback}
                        className="text-xs h-8 px-3 gap-1 bg-[#efa736] hover:bg-[#e09827] text-stone-950 font-bold rounded-xl shadow-xs"
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
        <div className="bg-white border border-stone-200/80 rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#1f4e47] text-[#efa736] flex items-center justify-center font-bold text-3xl shadow-sm border border-stone-100 overflow-hidden shrink-0">
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
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
                  {restaurant.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e4f8ed] text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-[#2f6858]" />
                  <span>Verified Menu</span>
                </span>
              </div>

              {restaurant.description && (
                <p className="text-xs text-stone-600 leading-relaxed">
                  {restaurant.description}
                </p>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-stone-500">
                {restaurant.opening_hours && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 text-[11px] font-medium">
                    <Clock className="w-3 h-3 text-[#efa736]" />
                    <span>{restaurant.opening_hours}</span>
                  </div>
                )}

                {restaurant.address && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 hover:text-stone-950 text-[11px] font-medium"
                  >
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span className="truncate max-w-[170px]">{restaurant.address}</span>
                  </a>
                )}

                {restaurant.phone && (
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 hover:text-stone-950 text-[11px] font-medium"
                  >
                    <Phone className="w-3 h-3 text-stone-400" />
                    <span>{restaurant.phone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search & Dietary Filters Container */}
        <div className="bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl p-3.5 shadow-sm space-y-3 sticky top-[57px] z-30">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search dishes, drinks, or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-xs bg-[#f5f4ef] border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#efa736] text-stone-900 placeholder:text-stone-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
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
                  ? 'bg-[#1f4e47] text-white shadow-xs'
                  : 'bg-[#f5f4ef] text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span>All Dishes</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategoryId === 'all'
                  ? 'bg-[#133e36] text-[#efa736]'
                  : 'bg-stone-200 text-stone-600'
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
                      ? 'bg-[#1f4e47] text-white shadow-xs'
                      : 'bg-[#f5f4ef] text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-[#133e36] text-[#efa736]'
                      : 'bg-stone-200 text-stone-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dietary Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-stone-100 text-xs">
            <span className="text-[10px] font-black text-stone-400 shrink-0 uppercase tracking-[0.16em]">
              Diet:
            </span>

            <button
              onClick={() => setDietaryFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                dietaryFilter === 'all'
                  ? 'bg-stone-200 text-stone-900 font-bold'
                  : 'bg-[#f5f4ef] text-stone-500 hover:text-stone-800'
              }`}
            >
              All
            </button>

            <button
              onClick={() => setDietaryFilter(dietaryFilter === 'veg' ? 'all' : 'veg')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                dietaryFilter === 'veg'
                  ? 'bg-[#2f6858] text-white shadow-xs'
                  : 'bg-[#e4f8ed] text-emerald-800 border border-emerald-200/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Veg Only</span>
            </button>

            <button
              onClick={() => setDietaryFilter(dietaryFilter === 'non-veg' ? 'all' : 'non-veg')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                dietaryFilter === 'non-veg'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 border border-rose-200/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>Non-Veg</span>
            </button>

            <button
              onClick={() => setDietaryFilter(dietaryFilter === 'vegan' ? 'all' : 'vegan')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                dietaryFilter === 'vegan'
                  ? 'bg-[#1f4e47] text-white shadow-xs'
                  : 'bg-[#f5f4ef] text-stone-600'
              }`}
            >
              <Leaf className="w-3 h-3 text-[#2f6858]" />
              <span>Vegan</span>
            </button>
          </div>
        </div>

        {/* Menu Items Feed */}
        {filteredItems.length === 0 ? (
          <div className="bg-white border border-stone-200/80 rounded-3xl p-12 text-center shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              No Dishes Found
            </h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              No dishes match your selected search or dietary filter.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedItems.map((group) => (
              <section key={group.categoryId} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-base font-bold text-stone-900 tracking-tight">
                    {group.categoryName}
                  </h2>
                  <span className="text-xs text-stone-500 font-medium">
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
                        className={`group bg-white border rounded-2xl p-3.5 shadow-sm hover:shadow-card hover:border-stone-300 transition-all cursor-pointer flex gap-3.5 justify-between relative overflow-hidden select-none ${
                          item.available
                            ? 'border-stone-200/80 active:scale-[0.99]'
                            : 'border-stone-200/60 opacity-60 bg-stone-50/50'
                        }`}
                      >
                        {/* Left Details */}
                        <div className="flex-1 flex flex-col justify-between min-w-0 space-y-1">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <DietarySymbol type={item.dietary_type || (item.is_veg ? 'veg' : 'non-veg')} />
                              {item.available ? (
                                <span className="text-[10px] font-bold text-[#2f6858] uppercase tracking-wide">
                                  Freshly Prepared
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide bg-amber-50 px-1.5 py-0.2 rounded">
                                  Sold Out
                                </span>
                              )}
                            </div>

                            <h3 className="font-bold text-sm text-stone-900 leading-tight group-hover:text-[#1f4e47] transition-colors line-clamp-1">
                              {item.name}
                            </h3>

                            {item.description && (
                              <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>

                          {/* Price & Add to Cart Stepper */}
                          <div className="pt-2 flex items-center justify-between">
                            <span className="text-sm font-bold text-stone-900 tabular-nums">
                              ${Number(item.price).toFixed(2)}
                            </span>

                            {item.available && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center"
                              >
                                {cartEntry ? (
                                  <div className="flex items-center bg-[#1f4e47] text-white rounded-xl p-0.5 shadow-xs">
                                    <button
                                      onClick={(e) => handleDecreaseQuantity(item.id, e)}
                                      className="p-1 hover:bg-[#133e36] rounded-lg transition-colors text-[#efa736]"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-xs font-bold px-2 select-none text-white tabular-nums">
                                      {cartEntry.quantity}
                                    </span>
                                    <button
                                      onClick={(e) => handleAddToCart(item, e)}
                                      className="p-1 hover:bg-[#133e36] rounded-lg transition-colors text-[#efa736]"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={(e) => handleAddToCart(item, e)}
                                    className="px-3 py-1 rounded-xl bg-[#efa736] text-stone-950 text-xs font-bold hover:bg-[#e09827] transition-colors shadow-xs flex items-center gap-1"
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
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden relative shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                                !item.available ? 'grayscale opacity-75' : ''
                              }`}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              <Utensils className="w-7 h-7" />
                            </div>
                          )}

                          {!item.available && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-wider text-center p-1">
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
          <aside aria-label="Dining Cart" className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto animate-in slide-in-from-bottom-5 duration-200">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-[#1f4e47] text-white p-3.5 sm:p-4 rounded-2xl shadow-elevated border border-[#133e36] flex items-center justify-between hover:bg-[#133e36] transition-all font-bold group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#efa736] text-stone-950 flex items-center justify-center text-xs font-black shadow-xs">
                  {cartItemCount}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold tracking-tight leading-none text-white">View Order Cart</span>
                  <span className="text-[11px] text-emerald-200/80 mt-0.5 font-normal">
                    {cart.length} {cart.length === 1 ? 'dish' : 'dishes'} selected for table
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#efa736] tabular-nums">
                  ${cartTotal.toFixed(2)}
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#133e36] text-[#efa736] flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
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
              className="relative w-full max-w-lg bg-[#faf9f6] rounded-t-[32px] sm:rounded-[32px] border border-stone-200/90 shadow-elevated overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#1f4e47] text-[#efa736] flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-stone-900">
                    Your Table Order Cart
                  </h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  aria-label="Close cart"
                  className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-5 space-y-5">
                {orderError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{orderError}</span>
                  </div>
                )}

                {/* Table Number Selector */}
                <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
                  <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider">
                    Dining Table Number *
                  </label>
                  <Input
                    placeholder="e.g. Table 4, Bar 2, Patio 10"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="bg-white border-amber-300 font-bold text-sm text-stone-900 focus:border-[#efa736] focus:ring-[#efa736]/20"
                    required
                  />
                  <span className="text-[11px] text-stone-500 block">
                    Verify the number printed on your table tent for accurate delivery.
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Selected Dishes ({cartItemCount})
                  </h3>

                  <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                    {cart.map((cartItem) => (
                      <div
                        key={cartItem.menuItem.id}
                        className="p-3.5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200/60">
                            {cartItem.menuItem.image ? (
                              <img
                                src={cartItem.menuItem.image}
                                alt={cartItem.menuItem.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Utensils className="w-5 h-5 m-auto text-stone-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-stone-900 block truncate">
                              {cartItem.menuItem.name}
                            </span>
                            <span className="text-[11px] text-stone-500 tabular-nums">
                              ${Number(cartItem.menuItem.price).toFixed(2)} each
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-[#f5f4ef] border border-stone-200 rounded-xl p-0.5">
                            <button
                              type="button"
                              onClick={() => handleDecreaseQuantity(cartItem.menuItem.id)}
                              className="p-1 hover:bg-stone-200 rounded-lg transition-colors text-stone-700"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold px-2 tabular-nums text-stone-900">
                              {cartItem.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(cartItem.menuItem)}
                              className="p-1 hover:bg-stone-200 rounded-lg transition-colors text-stone-700"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-bold text-stone-900 w-16 text-right tabular-nums">
                            ${(Number(cartItem.menuItem.price) * cartItem.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Cooking Instructions */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                    Special Cooking Instructions & Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Please dressing on the side, allergies, extra napkins..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#efa736]"
                  />
                </div>

                {/* Bill Summary */}
                <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2 text-xs shadow-xs">
                  <div className="flex justify-between text-stone-500">
                    <span>Subtotal</span>
                    <span className="font-medium tabular-nums">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Service & Tax</span>
                    <span className="text-emerald-700 font-semibold">Included</span>
                  </div>
                  <div className="pt-2 border-t border-stone-100 flex justify-between font-bold text-sm text-stone-900">
                    <span>Total Order Amount</span>
                    <span className="tabular-nums text-base text-[#1f4e47]">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  isLoading={isPlacingOrder}
                  className="w-full gap-2 font-bold shadow-sm h-12 bg-[#efa736] hover:bg-[#e09827] text-stone-950 rounded-xl"
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
              className="relative w-full max-w-lg bg-[#faf9f6] rounded-t-[32px] sm:rounded-[32px] border border-stone-200/90 shadow-elevated overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-60 sm:h-72 w-full bg-stone-100 shrink-0">
                {selectedItemForModal.image ? (
                  <img
                    src={selectedItemForModal.image}
                    alt={selectedItemForModal.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
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

                <div className="absolute bottom-4 right-4 bg-[#1f4e47] text-[#efa736] px-3.5 py-1.5 rounded-xl text-base font-bold shadow-lg tabular-nums">
                  ${Number(selectedItemForModal.price).toFixed(2)}
                </div>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <DietarySymbol type={selectedItemForModal.dietary_type || (selectedItemForModal.is_veg ? 'veg' : 'non-veg')} />
                    <span className="text-xs font-medium text-stone-500">
                      {categoryMap.get(selectedItemForModal.category_id) || 'Specialty Dish'}
                    </span>
                    {selectedItemForModal.available ? (
                      <span className="ml-auto text-xs font-bold text-emerald-800 bg-[#e4f8ed] px-2.5 py-0.5 rounded-full border border-emerald-200">
                        🟢 Available
                      </span>
                    ) : (
                      <span className="ml-auto text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        🔴 Sold Out
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-stone-900">
                    {selectedItemForModal.name}
                  </h2>
                </div>

                {selectedItemForModal.description && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                      Ingredients & Preparation
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      {selectedItemForModal.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-stone-400 block">Price</span>
                  <span className="text-lg font-bold text-stone-900 tabular-nums">
                    ${Number(selectedItemForModal.price).toFixed(2)}
                  </span>
                </div>

                {selectedItemForModal.available && (
                  <Button
                    size="md"
                    onClick={() => {
                      handleAddToCart(selectedItemForModal);
                      setSelectedItemForModal(null);
                    }}
                    className="gap-2 font-bold bg-[#efa736] hover:bg-[#e09827] text-stone-950 rounded-xl"
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
        <footer className="p-4 text-center text-xs text-stone-400 border-t border-stone-200 bg-white/60">
          Powered by BitePoint &bull; Modern Culinary OS
        </footer>
      </div>
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
