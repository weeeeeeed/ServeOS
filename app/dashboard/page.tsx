'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutGrid,
  UtensilsCrossed,
  Receipt,
  TableProperties,
  Wallet,
  Settings,
  MessageSquare,
  Megaphone,
  LogOut,
  Users,
  CreditCard,
  ExternalLink,
  ChevronRight,
  Flame,
  ChefHat,
  Sparkles,
} from 'lucide-react';
import { BitepointOverview } from '@/components/dashboard/bitepoint-overview';
import { KitchenOrders } from '@/components/dashboard/kitchen-orders';
import { MenuManagement } from '@/components/dashboard/menu-management';
import { TableQrStudio } from '@/components/dashboard/table-qr-studio';
import { AccountingLedger } from '@/components/dashboard/accounting-ledger';
import { BitepointSettings } from '@/components/dashboard/bitepoint-settings';
import { FeedbackSection } from '@/components/dashboard/feedback-section';
import { MarketingHub } from '@/components/dashboard/marketing-hub';
import { StaffManagement } from '@/components/dashboard/staff-management';
import { BillingPanel } from '@/components/dashboard/billing-panel';
import { NotificationDrawer } from '@/components/dashboard/notification-drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthService } from '@/lib/auth-service';
import { OrderService } from '@/lib/order-service';
import { FeedbackService } from '@/lib/feedback-service';
import { TableService } from '@/lib/table-service';
import { User, Restaurant, OrderWithItems, FeedbackStats, RestaurantTable } from '@/lib/types';
import { ServeOSLogo } from '@/components/ui/botanical-decorations';

type ActiveDashboardTab =
  | 'overview'
  | 'orders'
  | 'menu'
  | 'tables'
  | 'staff'
  | 'billing'
  | 'accounting'
  | 'feedback'
  | 'marketing'
  | 'settings';

export default function ServeOSDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveDashboardTab>('overview');
  const [loading, setLoading] = useState(true);

  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats>({
    averageRating: 5.0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  const loadDashboard = async () => {
    const session = AuthService.getCurrentSession();
    if (!session.user) {
      router.push('/login?redirect=/dashboard');
      return;
    }

    if (session.user.role === 'admin') {
      router.push('/admin');
      return;
    }

    setUser(session.user);
    setRestaurant(session.restaurant);

    if (session.restaurant?.id) {
      const [oList, fStats, tList] = await Promise.all([
        OrderService.getRestaurantOrders(session.restaurant.id),
        FeedbackService.getFeedbackStats(session.restaurant.id),
        TableService.getTables(session.restaurant.id),
      ]);
      setOrders(oList);
      setFeedbackStats(fStats);
      setTables(tList);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, [router]);

  useEffect(() => {
    const handleTablesUpdated = (e: any) => {
      if (restaurant?.id && (!e.detail || e.detail.restaurantId === restaurant.id)) {
        if (e.detail?.tables && Array.isArray(e.detail.tables)) {
          setTables(e.detail.tables);
        } else {
          TableService.getTables(restaurant.id).then((tList) => setTables(tList));
        }
      }
    };
    window.addEventListener('serveos_tables_updated', handleTablesUpdated);
    return () => window.removeEventListener('serveos_tables_updated', handleTablesUpdated);
  }, [restaurant?.id]);

  const handleLogout = async () => {
    await AuthService.logout();
    router.push('/login');
  };

  if (loading || !restaurant || !user) {
    return (
      <div className="min-h-screen bg-[#f4f1eb] p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-[1560px] bg-[#faf8f5] rounded-[36px] p-8 shadow-xs border border-[#e6e2da] space-y-6">
          <Skeleton className="h-12 w-64 bg-[#e6e2da] rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-32 bg-[#ebe7df] rounded-2xl" />
            <Skeleton className="h-32 bg-[#ebe7df] rounded-2xl" />
            <Skeleton className="h-32 bg-[#ebe7df] rounded-2xl" />
            <Skeleton className="h-32 bg-[#ebe7df] rounded-2xl" />
          </div>
          <Skeleton className="h-96 w-full bg-[#ebe7df] rounded-3xl" />
        </div>
      </div>
    );
  }

  const activeOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'preparing').length;

  const navItems = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutGrid, count: null },
    { id: 'orders' as const, label: 'Orders & Kitchen', icon: Receipt, count: activeOrdersCount },
    { id: 'menu' as const, label: 'Menu Catalog', icon: UtensilsCrossed, count: null },
    { id: 'tables' as const, label: 'Tables & QR Studio', icon: TableProperties, count: tables.length },
    { id: 'staff' as const, label: 'Staff & Roster', icon: Users, count: null },
    { id: 'billing' as const, label: 'Plan & Billing', icon: CreditCard, count: null },
    { id: 'accounting' as const, label: 'Accounting & Sales', icon: Wallet, count: null },
    { id: 'feedback' as const, label: 'Guest Reviews', icon: MessageSquare, count: null },
    { id: 'marketing' as const, label: 'Push Marketing', icon: Megaphone, count: null, isNew: true },
    { id: 'settings' as const, label: 'Settings', icon: Settings, count: null },
  ];

  return (
    <div className="min-h-screen bg-[#f4efe8] p-3 sm:p-5 lg:p-7 flex items-center justify-center font-sans antialiased text-[#162820] relative overflow-hidden">
      
      

      
      

      
      

      {/* Outer Rounded Board Container - ServeOS Botanical Manager Frame */}
      <main className="w-full max-w-[1600px] bg-[#faf8f5] rounded-[36px] shadow-[0_24px_70px_rgba(18,40,32,0.07)] border border-[#e4ded4] overflow-hidden flex flex-col lg:flex-row min-h-[940px] relative z-10">
        {/* Left Sidebar Navigation */}
        <aside className="w-full lg:w-64 xl:w-72 bg-[#fdfbf7] border-r border-[#e6e2da] flex flex-col justify-between p-5 shrink-0">
          <div>
            {/* ServeOS Brand Logo */}
            <div className="px-2 py-3 mb-6">
              <ServeOSLogo size="md" showTagline={true} />
            </div>

            {/* Navigation Links */}
            <nav aria-label="Main Navigation" className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 text-left ${
                      isActive
                        ? 'bg-[#1b3b2f] text-[#f8faf7] shadow-xs'
                        : 'text-[#556960] hover:text-[#1b3b2f] hover:bg-[#eef4f0]/70'
                    }`}
                    type="button"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#eef4f0]' : 'text-[#85988e]'}`} />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.count !== null && item.count > 0 && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isActive ? 'bg-[#3a7d5c] text-white' : 'bg-[#eef4f0] text-[#1b3b2f] border border-[#d2ded6]'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                      {item.isNew && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md font-extrabold bg-[#eef4f0] text-[#1b3b2f] border border-[#cbe0d3]">
                          NEW
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          
          

          {/* User Profile Card in Sidebar */}
          <div className="pt-3 mt-4 border-t border-[#e6e2da]">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/90 border border-[#e6e2da] shadow-2xs hover:bg-white transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-[#eef4f0] text-[#1b3b2f] font-serif font-bold flex items-center justify-center text-xs tracking-wider border border-[#d2ded6] shrink-0">
                  {user.name
                    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                    : (user.email ? user.email.slice(0, 2).toUpperCase() : 'SO')}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1b3b2f] truncate font-sans">
                    {user.name || (user.email ? user.email.split('@')[0] : 'Merchant')}
                  </p>
                  <p className="text-[10px] font-medium text-[#85988e] capitalize truncate">
                    {user.role === 'owner' ? 'Owner / General Manager' : (user.role === 'admin' ? 'Administrator' : 'Staff Member')}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                aria-label="Log Out"
                className="p-1.5 text-[#85988e] hover:text-[#b84232] rounded-xl hover:bg-[#f8f5f0] transition shrink-0"
                type="button"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-5 lg:p-8 xl:p-9 bg-[#faf8f5]">
          {/* Top Operational Navigation Bar */}
          <div className="flex items-center justify-between gap-4 pb-4 mb-6 border-b border-[#e6e2da] shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#eef4f0] text-[#1b3b2f] border border-[#d2ded6]">
                <span className="w-2 h-2 rounded-full bg-[#3a7d5c] animate-pulse" />
                <span className="text-[11px] font-bold tracking-wider uppercase font-sans">
                  {restaurant.name}
                </span>
              </div>
              <span className="text-[#c5beb2] hidden sm:inline">&bull;</span>
              <a
                href={`/r/${restaurant.slug}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex text-xs font-semibold text-[#1b3b2f] hover:text-[#3a7d5c] items-center gap-1.5 bg-white px-3 py-1 rounded-xl border border-[#e6e2da] shadow-2xs transition-colors"
              >
                <span>Preview Customer Menu</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#85988e]" />
              </a>
            </div>

            <div className="flex items-center gap-3">
              <NotificationDrawer restaurantId={restaurant.id} />
            </div>
          </div>

          {activeTab === 'overview' && (
            <BitepointOverview
              restaurant={restaurant}
              orders={orders}
              tables={tables}
              onSelectTab={(tab) => setActiveTab(tab as any)}
            />
          )}

          {activeTab === 'orders' && (
            <KitchenOrders
              restaurantId={restaurant.id}
              onStatsChange={async () => {
                const refreshed = await OrderService.getRestaurantOrders(restaurant.id);
                setOrders(refreshed);
              }}
            />
          )}

          {activeTab === 'menu' && (
            <MenuManagement restaurantId={restaurant.id} />
          )}

          {activeTab === 'tables' && (
            <TableQrStudio
              restaurant={restaurant}
              tables={tables}
              onTablesUpdated={async () => {
                const refreshed = await TableService.getTables(restaurant.id);
                setTables(refreshed);
              }}
            />
          )}

          {activeTab === 'staff' && (
            <StaffManagement restaurant={restaurant} />
          )}

          {activeTab === 'billing' && (
            <BillingPanel restaurant={restaurant} />
          )}

          {activeTab === 'accounting' && (
            <AccountingLedger restaurant={restaurant} orders={orders} />
          )}

          {activeTab === 'feedback' && (
            <FeedbackSection restaurantId={restaurant.id} />
          )}

          {activeTab === 'marketing' && (
            <MarketingHub restaurant={restaurant} />
          )}

          {activeTab === 'settings' && (
            <BitepointSettings
              restaurant={restaurant}
              onUpdateRestaurant={(updated) => setRestaurant(updated)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
