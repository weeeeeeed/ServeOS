export type UserRole = 'admin' | 'owner' | 'customer';

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'inactive';

export type SubscriptionPlan = 'Starter' | 'Pro' | 'Enterprise' | 'Growth';

export type DietaryType = 'veg' | 'non-veg' | 'vegan';

export type OrderStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'owner';
  created_at: string;
  updated_at?: string;
}

export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo?: string | null;
  address?: string | null;
  phone?: string | null;
  opening_hours?: string | null;
  description?: string | null;
  subscription_status: SubscriptionStatus;
  marketing_enabled?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  created_at: string;
  updated_at?: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  available: boolean;
  is_veg?: boolean;
  dietary_type?: DietaryType;
  created_at: string;
  updated_at?: string;
}

export interface MenuItemWithCategory extends MenuItem {
  category?: Category;
}

export type TableStatus = 'active' | 'in_service' | 'idle' | 'reserved';

export interface RestaurantTable {
  id: string;
  restaurant_id: string;
  name: string;
  zone: string;
  capacity: number;
  status: TableStatus;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id?: string | null;
  name: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  table_number: string;
  customer_notes?: string | null;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  updated_at?: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export interface Feedback {
  id: string;
  restaurant_id: string;
  order_id?: string | null;
  customer_name?: string | null;
  rating: number; // 1 - 5
  comment?: string | null;
  created_at: string;
}

export interface FeedbackStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface Subscription {
  id: string;
  restaurant_id: string;
  plan: SubscriptionPlan;
  start_date: string;
  expiry_date: string;
  status: SubscriptionStatus;
  created_at: string;
  updated_at?: string;
}

export interface SubscriptionWithRestaurant extends Subscription {
  restaurant?: Restaurant;
  owner?: {
    name: string;
    email: string;
  };
}

export interface DailySalesPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface MonthlySalesPoint {
  month: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface PopularDish {
  id: string;
  name: string;
  categoryName?: string;
  image?: string | null;
  totalQuantity: number;
  totalRevenue: number;
  percentageOfSales: number;
}

export interface PeakHourPoint {
  hour: string;
  label: string;
  orders: number;
}

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  averageRating: number;
  totalReviews: number;
  revenueGrowthRate: number;
  dailySales: DailySalesPoint[];
  monthlySales: MonthlySalesPoint[];
  popularDishes: PopularDish[];
  peakHours: PeakHourPoint[];
}

export interface TenantWithDetails extends Restaurant {
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  totalMenuItems?: number;
  totalCategories?: number;
  totalOrders?: number;
  grossRevenue?: number;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionExpiry?: string;
}

export interface DashboardMetrics {
  totalTenants: number;
  activeSubscriptions: number;
  trialingTenants: number;
  totalUsers: number;
}

export interface PlatformAnalytics {
  totalRestaurants: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  activeSubscriptions: number;
  trialingTenants: number;
  planDistribution: {
    Starter: number;
    Pro: number;
    Enterprise: number;
  };
}

export interface OwnerMenuStats {
  totalItems: number;
  availableItems: number;
  unavailableItems: number;
  totalCategories: number;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  completedOrders: number;
  todayRevenue: number;
}

export interface NotificationSubscription {
  id: string;
  restaurant_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  browser?: string;
  device?: string;
  created_at: string;
  last_seen?: string;
  active: boolean;
}

export interface MarketingCampaign {
  id: string;
  restaurant_id: string;
  title: string;
  message: string;
  image_url?: string | null;
  cta_url?: string | null;
  sent_at: string;
  total_targeted: number;
  total_sent: number;
  total_failed: number;
}

export interface MarketingStats {
  totalSubscribers: number;
  activeSubscribers: number;
  campaignsSent: number;
  lastCampaignDate?: string | null;
  openRateEstimated: string;
}

export interface SendCampaignResult {
  success: boolean;
  campaign?: MarketingCampaign;
  totalTargeted: number;
  totalSent: number;
  totalFailed: number;
  inactiveMarked: number;
  error?: string;
}

// ==========================================
// SUBSCRIPTION PLANS (DYNAMIC PRICING CATALOG)
// ==========================================
export interface SubscriptionPlanEntity {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_restaurants: number;
  max_qr_codes: number;
  max_orders: number;
  max_staff: number;
  marketing_enabled: boolean;
  ai_enabled: boolean;
  analytics_enabled: boolean;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// ADMIN COMMUNICATIONS & BROADCASTS
// ==========================================
export type AnnouncementPriority = 'normal' | 'important' | 'critical';

export type AnnouncementAudience = 'all' | 'trial' | 'premium' | 'expired' | 'specific';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: AnnouncementPriority;
  target_audience: AnnouncementAudience;
  target_restaurant_id?: string | null;
  target_restaurant_name?: string | null;
  image_url?: string | null;
  cta_label?: string | null;
  cta_url?: string | null;
  scheduled_at?: string | null;
  created_at: string;
  created_by: string;
  total_sent?: number;
  total_read?: number;
}

export interface RestaurantNotification {
  id: string;
  restaurant_id: string;
  announcement_id: string;
  announcement: Announcement;
  read: boolean;
  read_at?: string | null;
  created_at: string;
}

