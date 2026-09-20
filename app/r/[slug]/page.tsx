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
import { TableService } from '@/lib/table-service';
import { Restaurant, Category, MenuItem, DietaryType, CartItem, OrderWithItems, Feedback, RestaurantTable } from '@/lib/types';
import { formatCurrency, CURRENCY_SYMBOL } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { PushPromptModal } from '@/components/customer/push-prompt-modal';
import { BotanicalLeafBranch, ServeOSLogo } from '@/components/ui/botanical-decorations';

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
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-[#3a7d5c] bg-[#eef4f0] text-[10px] font-bold text-[#1b3b2f] shrink-0"
      >
        <Leaf className="w-2.5 h-2.5 text-[#3a7d5c]" />
        <span>VEGAN</span>
      </span>
    );
  }

  if (effectiveType === 'veg') {
    return (
      <span
        title="Vegetarian"
        className="w-3.5 h-3.5 rounded border-2 border-[#3a7d5c] flex items-center justify-center bg-white shrink-0"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#3a7d5c]" />
      </span>
    );
  }

  return (
    <span
      title="Non-Vegetarian"
      className="w-3.5 h-3.5 rounded border-2 border-rose-600 flex items-center justify-center bg-white shrink-0"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
    </span>
  );
}

function CustomerMenuFallback() {
  return (
    <div className="min-h-screen bg-[#f4f1eb] p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-4 bg-[#faf8f5] p-6 rounded-[36px] border border-[#e6e2da] shadow-xs">
        <Skeleton className="h-20 w-20 rounded-2xl mx-auto bg-[#e6e2da]" />
        <Skeleton className="h-6 w-48 mx-auto bg-[#e6e2da]" />
        <Skeleton className="h-4 w-64 mx-auto bg-[#ebe7df]" />
        <div className="space-y-3 pt-6">
          <Skeleton className="h-28 w-full rounded-2xl bg-[#ebe7df]" />
          <Skeleton className="h-28 w-full rounded-2xl bg-[#ebe7df]" />
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
  const [restaurantTables, setRestaurantTables] = useState<RestaurantTable[]>([]);
  const [tableNumber, setTableNumber] = useState(tableParam || '');
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
          const [cats, items, tbls] = await Promise.all([
            MenuService.getCategories(res.id),
            MenuService.getMenuItems(res.id),
            TableService.getTables(res.id),
          ]);
          setCategories(cats);
          setMenuItems(items);
          setRestaurantTables(tbls);

          // Configure table number from param or first active table
          if (tableParam) {
            const matched = tbls.find(
              (t) =>
                t.name.toLowerCase() === tableParam.toLowerCase() ||
                t.name.toLowerCase().replace(/[^a-z0-9]/g, '') === tableParam.toLowerCase().replace(/[^a-z0-9]/g, '')
            );
            setTableNumber(matched ? matched.name : tableParam);
          } else if (tbls.length > 0) {
            setTableNumber(tbls[0].name);
          } else {
            setTableNumber('Table 1');
          }
        }
        setLoading(false);
      });
    }
  }, [slug, tableParam]);

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

    toast.success('Added to Cart', `${item.name} (${formatCurrency(item.price)})`);
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
        categoryName: 'Artisan Specials',
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
      <div className="min-h-screen bg-[#f4f1eb] p-6 flex flex-col items-center justify-center text-center antialiased">
        <div className="max-w-md w-full bg-[#faf8f5] border border-[#e6e2da] rounded-4xl p-8 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#eef4f0] text-[#1b3b2f] flex items-center justify-center mx-auto">
            <Store className="w-7 h-7 text-[#3a7d5c]" />
          </div>
          <h1 className="text-xl font-serif font-bold text-[#1b3b2f]">Restaurant Menu Not Found</h1>
          <p className="text-xs text-[#556960] leading-relaxed">
            No active dining establishment found at <code className="bg-white px-1.5 py-0.5 rounded text-xs font-mono">/r/{slug}</code>.
          </p>
          <div className="pt-2">
            <Link href="/">
              <Button size="sm" className="gap-2 bg-[#1b3b2f] hover:bg-[#122820] text-white font-semibold rounded-2xl shadow-xs">
                <ArrowLeft className="w-4 h-4" />
                <span>Return to ServeOS Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f1eb] py-2 sm:py-6 px-2 sm:px-4 flex flex-col items-center antialiased text-[#162820] pb-32">
      {/* Phone/Tablet Container - ServeOS Botanical Frame */}
      <div className="w-full max-w-xl bg-[#faf8f5] rounded-[32px] sm:rounded-[40px] border border-[#e6e2da] shadow-xs overflow-hidden flex flex-col min-h-[92vh] relative">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-[#faf8f5]/90 backdrop-blur-md border-b border-[#e6e2da] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-[#1b3b2f] text-white flex items-center justify-center shrink-0">
                <Leaf className="w-4 h-4 text-[#eef4f0]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-serif font-bold tracking-tight text-[#1b3b2f] truncate">
                  {restaurant.name}
                </span>
                <span className="text-[10px] text-[#3a7d5c] font-semibold flex items-center gap-1 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3a7d5c] animate-pulse" />
                  Table Dining Experience
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#eef4f0] text-[#1b3b2f] border border-[#d2ded6] text-xs font-bold font-serif">
                <span>{tableNumber}</span>
              </span>

              {activeOrder && (
                <button
                  onClick={() => {}}
                  className="px-2.5 py-1 rounded-full bg-[#1b3b2f] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <ChefHat className="w-3.5 h-3.5 text-[#eef4f0]" />
                  <span>Tracking</span>
                </button>
              )}

              <button
                onClick={handleShare}
                aria-label="Share Menu Link"
                className="p-2 rounded-2xl bg-white text-[#556960] hover:text-[#1b3b2f] border border-[#e6e2da] transition-colors"
                title="Share Menu"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="w-full px-3 sm:px-4 py-4 space-y-4 flex-1">
          {/* Active Order Live Tracker */}
          {activeOrder && (
            <div className="bg-[#1b3b2f] text-[#f8faf7] rounded-3xl p-5 border border-[#122820] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#eef4f0] animate-ping" />
                  <h3 className="font-serif font-bold text-sm tracking-tight">
                    Order In Progress
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#d2ded6] bg-[#122820] px-2.5 py-0.5 rounded-full">
                  {activeOrder.table_number.toUpperCase()} &bull; #{activeOrder.id.slice(-6)}
                </span>
              </div>

              {/* Status Steps Progress */}
              <div className="grid grid-cols-4 gap-2 text-center pt-1">
                <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  activeOrder.status === 'pending'
                    ? 'bg-[#3a7d5c] border-[#3a7d5c] text-white font-bold'
                    : 'bg-[#122820]/70 border-[#2a4d3f] text-[#d2ded6]'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[9px] uppercase font-bold tracking-wider">Received</span>
                </div>

                <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  activeOrder.status === 'preparing'
                    ? 'bg-[#3a7d5c] border-[#3a7d5c] text-white font-bold'
                    : activeOrder.status === 'ready' || activeOrder.status === 'completed'
                    ? 'bg-[#122820] border-[#3a7d5c] text-white'
                    : 'bg-[#122820]/70 border-[#2a4d3f] text-[#d2ded6]'
                }`}>
                  <ChefHat className="w-3.5 h-3.5" />
                  <span className="text-[9px] uppercase font-bold tracking-wider">Cooking</span>
                </div>

                <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  activeOrder.status === 'ready'
                    ? 'bg-[#3a7d5c] border-[#3a7d5c] text-white font-bold animate-pulse'
                    : activeOrder.status === 'completed'
                    ? 'bg-[#122820] border-[#3a7d5c] text-white'
                    : 'bg-[#122820]/70 border-[#2a4d3f] text-[#d2ded6]'
                }`}>
                  <Bell className="w-3.5 h-3.5" />
                  <span className="text-[9px] uppercase font-bold tracking-wider">Plated</span>
                </div>

                <div className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  activeOrder.status === 'completed'
                    ? 'bg-[#3a7d5c] border-[#3a7d5c] text-white font-bold'
                    : 'bg-[#122820]/70 border-[#2a4d3f] text-[#d2ded6]'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="text-[9px] uppercase font-bold tracking-wider">Served</span>
                </div>
              </div>

              <div className="p-3 bg-[#122820] rounded-2xl text-xs flex items-center justify-between text-[#eef4f0]">
                <span>
                  {activeOrder.status === 'pending' && 'Kitchen received your ticket and will begin prep momentarily.'}
                  {activeOrder.status === 'preparing' && 'Dishes are currently being crafted fresh at the kitchen line.'}
                  {activeOrder.status === 'ready' && 'Plated! Server is bringing dishes to your table.'}
                  {activeOrder.status === 'completed' && 'Delivered! Bon appétit.'}
                </span>
                <span className="font-bold shrink-0">{formatCurrency(activeOrder.total_amount)}</span>
              </div>
            </div>
          )}

          {/* Restaurant Bio Card */}
          <div className="bg-white/95 rounded-3xl p-5 border border-[#e6e2da] shadow-2xs relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-serif font-bold text-xl text-[#1b3b2f]">
                  {restaurant.name}
                </h2>
                <p className="text-xs text-[#556960] mt-1 leading-relaxed">
                  {restaurant.description || 'Artisan cuisine, slow-simmered sauces, and botanical craft beverages.'}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-[#85988e]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#3a7d5c]" />
                    Open 11:00 AM – 11:00 PM
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#3a7d5c]" />
                    {restaurant.address || 'Table Service'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Dietary Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#85988e] pointer-events-none" />
              <input
                type="text"
                placeholder="Search flavors, dishes, or ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] placeholder-[#85988e] focus:outline-none focus:ring-2 focus:ring-[#3a7d5c] shadow-2xs"
              />
            </div>

            {/* Category Scroll Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
              <button
                onClick={() => setSelectedCategoryId('all')}
                className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  selectedCategoryId === 'all'
                    ? 'bg-[#1b3b2f] text-white shadow-2xs font-bold'
                    : 'bg-white text-[#556960] hover:text-[#1b3b2f] border border-[#e6e2da]'
                }`}
                type="button"
              >
                All Menu
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategoryId(c.id)}
                  className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                    selectedCategoryId === c.id
                      ? 'bg-[#1b3b2f] text-white shadow-2xs font-bold'
                      : 'bg-white text-[#556960] hover:text-[#1b3b2f] border border-[#e6e2da]'
                  }`}
                  type="button"
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Dietary Tags */}
            <div className="flex items-center gap-1.5 text-[11px] font-semibold">
              {[
                { id: 'all', label: 'All Diets' },
                { id: 'veg', label: '🌿 Veg' },
                { id: 'vegan', label: '🌱 Vegan' },
                { id: 'non-veg', label: '🥩 Non-Veg' },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDietaryFilter(d.id as any)}
                  className={`px-3 py-1 rounded-xl transition-all ${
                    dietaryFilter === d.id
                      ? 'bg-[#eef4f0] text-[#1b3b2f] border border-[#d2ded6] font-bold'
                      : 'text-[#85988e] hover:text-[#1b3b2f]'
                  }`}
                  type="button"
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grouped Dishes */}
          {groupedItems.map((group) => (
            <div key={group.categoryId} className="space-y-3 pt-2">
              <div className="flex items-center gap-2 border-b border-[#e6e2da] pb-2">
                <h3 className="font-serif font-bold text-base text-[#1b3b2f]">
                  {group.categoryName}
                </h3>
                <span className="text-[11px] text-[#85988e]">({group.items.length})</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {group.items.map((item) => {
                  const cartEntry = cart.find((c) => c.menuItem.id === item.id);
                  const isAvailable = item.available;

                  return (
                    <div
                      key={item.id}
                      className={`bg-white/95 rounded-3xl p-3.5 border border-[#e6e2da] shadow-2xs flex gap-3 items-center justify-between transition-all ${
                        !isAvailable ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <DietarySymbol type={item.dietary_type || item.is_veg} />
                          <h4 className="font-serif font-bold text-sm text-[#1b3b2f] leading-snug">
                            {item.name}
                          </h4>
                        </div>

                        <p className="text-xs text-[#556960] mt-1 line-clamp-2 leading-relaxed">
                          {item.description || 'Crafted with premium fresh ingredients.'}
                        </p>

                        <div className="mt-2.5 flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-[#1b3b2f]">
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                      </div>

                      {/* Right: Dish Image & Add Button */}
                      <div className="flex flex-col items-center shrink-0 w-24">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#f4f1eb] border border-[#e6e2da] relative">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#85988e]">
                              <Utensils className="w-6 h-6 text-[#c5beb2]" />
                            </div>
                          )}
                        </div>

                        <div className="mt-2 w-full">
                          {cartEntry ? (
                            <div className="flex items-center justify-between bg-[#eef4f0] border border-[#d2ded6] rounded-xl px-2 py-1 text-xs">
                              <button
                                onClick={(e) => handleDecreaseQuantity(item.id, e)}
                                className="text-[#1b3b2f] hover:text-red-700 font-bold"
                              >
                                -
                              </button>
                              <span className="font-bold text-[#1b3b2f]">{cartEntry.quantity}</span>
                              <button
                                onClick={(e) => handleAddToCart(item, e)}
                                className="text-[#1b3b2f] hover:text-[#3a7d5c] font-bold"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              disabled={!isAvailable}
                              onClick={(e) => handleAddToCart(item, e)}
                              className={`w-full py-1 text-xs font-semibold rounded-xl transition-all shadow-2xs ${
                                isAvailable
                                  ? 'bg-[#1b3b2f] hover:bg-[#122820] text-white'
                                  : 'bg-[#f4f1eb] text-[#85988e] cursor-not-allowed'
                              }`}
                            >
                              {isAvailable ? 'Add +' : 'Sold Out'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Feedback Form (After dining) */}
          {activeOrder && !feedbackSubmitted && (
            <div className="mt-8 bg-white/95 rounded-3xl p-5 border border-[#e6e2da] shadow-2xs space-y-4">
              <div className="text-center">
                <h3 className="font-serif font-bold text-base text-[#1b3b2f]">
                  How was your dining experience?
                </h3>
                <p className="text-xs text-[#556960] mt-0.5">
                  Share direct feedback with the {restaurant.name} culinary team
                </p>
              </div>

              <form onSubmit={handleSubmitFeedback} className="space-y-3">
                <div className="flex justify-center items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-2xl transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          (hoverRating || rating) >= star
                            ? 'fill-[#d4af37] text-[#d4af37]'
                            : 'text-[#dcd7ce]'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  rows={2}
                  placeholder="Compliments to the chef or service notes..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-2xl border border-[#dcd7ce] bg-[#faf8f5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3a7d5c] text-[#162820]"
                />

                <Button
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="w-full bg-[#1b3b2f] hover:bg-[#122820] text-white rounded-2xl text-xs font-semibold py-2"
                >
                  {isSubmittingFeedback ? 'Sending...' : 'Submit Review'}
                </Button>
              </form>
            </div>
          )}

          {feedbackSubmitted && (
            <div className="p-4 bg-[#eef4f0] border border-[#d2ded6] rounded-3xl text-center space-y-1">
              <p className="font-serif font-bold text-sm text-[#1b3b2f]">Thank you for your feedback! ⭐</p>
              <p className="text-xs text-[#556960]">Your rating helps us keep our dishes delightful.</p>
            </div>
          )}

          {/* Powered by ServeOS Branding Footer */}
          <footer className="pt-10 pb-20 text-center select-none space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#e6e2da] shadow-2xs">
              <img
                src="/images/serveos-icon.png"
                alt="ServeOS"
                className="h-4 w-auto object-contain"
              />
              <span className="text-[11px] font-serif font-bold text-[#1b3b2f]">
                Powered by Serve<span className="text-[#3a7d5c]">OS</span>
              </span>
            </div>
            <p className="text-[10px] text-[#85988e] tracking-wide font-sans">
              Instant Contactless Dining &bull; All Rights Reserved
            </p>
          </footer>
        </main>

        {/* Floating Bottom Cart Bar */}
        {cartItemCount > 0 && (
          <div className="fixed bottom-4 inset-x-0 z-40 px-4 flex justify-center">
            <div className="w-full max-w-lg bg-[#1b3b2f] text-white rounded-3xl p-3.5 shadow-xl border border-[#122820] flex items-center justify-between animate-in slide-in-from-bottom-3 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#3a7d5c] text-white flex items-center justify-center font-bold text-sm">
                  {cartItemCount}
                </div>
                <div>
                  <span className="text-xs font-serif font-bold block">
                    {formatCurrency(cartTotal)}
                  </span>
                  <span className="text-[10px] text-[#d2ded6]">
                    {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} in order
                  </span>
                </div>
              </div>

              <Button
                onClick={() => setIsCartOpen(true)}
                className="bg-white text-[#1b3b2f] hover:bg-[#faf8f5] font-semibold text-xs px-4 py-2 rounded-2xl flex items-center gap-1.5 shadow-xs"
              >
                <span>View Order</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Sliding Cart Drawer Modal */}
        {isCartOpen && (
          <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-2xs flex items-end sm:items-center justify-center">
            <div className="bg-[#faf8f5] w-full max-w-lg rounded-t-4xl sm:rounded-4xl p-6 border border-[#e6e2da] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between pb-3 border-b border-[#e6e2da]">
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#1b3b2f]">Table Order Review</h3>
                  <p className="text-xs text-[#556960]">Confirm items before dispatching to kitchen</p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-full bg-white text-[#556960] hover:text-[#1b3b2f] flex items-center justify-center border border-[#e6e2da]"
                >
                  ✕
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                {cart.map((c) => (
                  <div key={c.menuItem.id} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#e6e2da] text-xs">
                    <div>
                      <span className="font-bold text-[#162820]">{c.menuItem.name}</span>
                      <span className="text-[11px] text-[#85988e] block font-sans">
                        {formatCurrency(c.menuItem.price)} each
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-[#eef4f0] rounded-xl px-2 py-1">
                        <button
                          onClick={() => handleDecreaseQuantity(c.menuItem.id)}
                          className="font-bold text-[#1b3b2f]"
                        >
                          -
                        </button>
                        <span className="font-bold text-[#1b3b2f]">{c.quantity}</span>
                        <button
                          onClick={() => handleAddToCart(c.menuItem)}
                          className="font-bold text-[#1b3b2f]"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-serif font-bold text-sm text-[#1b3b2f] min-w-[60px] text-right">
                        {formatCurrency(Number(c.menuItem.price) * c.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Number & Notes Inputs */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#1b3b2f]">
                      Confirm Table Number *
                    </label>
                    {tableParam && (
                      <span className="text-[10px] font-semibold text-[#3a7d5c] bg-[#eef4f0] px-2 py-0.5 rounded-full">
                        QR Scanned Table
                      </span>
                    )}
                  </div>
                  {restaurantTables.length > 0 ? (
                    <div className="space-y-1.5">
                      <select
                        value={restaurantTables.some((t) => t.name === tableNumber) ? tableNumber : (tableNumber ? 'other' : (restaurantTables[0]?.name || ''))}
                        onChange={(e) => {
                          if (e.target.value === 'other') {
                            setTableNumber('');
                          } else {
                            setTableNumber(e.target.value);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] focus:ring-2 focus:ring-[#3a7d5c] focus:outline-none"
                      >
                        {restaurantTables.map((tbl) => (
                          <option key={tbl.id} value={tbl.name}>
                            {tbl.name} ({tbl.zone} &bull; {tbl.capacity} Seats)
                          </option>
                        ))}
                        <option value="Takeaway">Takeaway / Self-Pickup</option>
                        <option value="other">Other / Custom Table Number...</option>
                      </select>

                      {(!restaurantTables.some((t) => t.name === tableNumber) && tableNumber !== 'Takeaway') && (
                        <input
                          type="text"
                          required
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                          placeholder="Enter custom table number or location..."
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#dcd7ce] bg-white text-[#162820] focus:ring-2 focus:ring-[#3a7d5c] focus:outline-none mt-1"
                        />
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      required
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="e.g. Table 1 or Patio P-1"
                      className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] focus:ring-2 focus:ring-[#3a7d5c] focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b3b2f] mb-1">
                    Kitchen Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Allergies, spice preferences, or extra napkins..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-[#dcd7ce] bg-white text-[#162820] focus:ring-2 focus:ring-[#3a7d5c] focus:outline-none"
                  />
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="pt-3 border-t border-[#e6e2da] space-y-1.5 text-xs text-[#556960]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#162820]">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dining GST (5%)</span>
                  <span className="font-medium text-[#162820]">{formatCurrency(cartTotal * 0.05)}</span>
                </div>
                <div className="flex justify-between text-base font-serif font-bold text-[#1b3b2f] pt-2 border-t border-[#e6e2da]">
                  <span>Total Due</span>
                  <span>{formatCurrency(cartTotal * 1.05)}</span>
                </div>
              </div>

              {orderError && (
                <p className="text-xs text-rose-600 font-medium">{orderError}</p>
              )}

              <Button
                disabled={isPlacingOrder}
                onClick={handlePlaceOrder}
                className="w-full bg-[#1b3b2f] hover:bg-[#122820] text-white rounded-2xl text-xs font-semibold py-3 shadow-sm"
              >
                {isPlacingOrder ? 'Sending Order to Kitchen...' : 'Send Order to Kitchen 🍳'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Web Push Prompt Modal for Customer Marketing Opt-in */}
      <PushPromptModal restaurantId={restaurant.id} restaurantName={restaurant.name} slug={restaurant.slug} />
    </div>
  );
}

export default function CustomerMenuPage() {
  return (
    <Suspense fallback={<CustomerMenuFallback />}>
      <PublicCustomerMenuContent />
    </Suspense>
  );
}
