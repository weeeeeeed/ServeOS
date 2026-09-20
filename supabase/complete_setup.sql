--
-- ============================================================================== 
-- SERVEOS: COMPLETE CONSOLIDATED SUPABASE SETUP SCRIPT
-- Run this in your Supabase Project -> SQL Editor -> New Query -> Run
-- Sets up all 12 tables, indexes, RLS policies, triggers, and seed data in ₹ INR.
-- ============================================================================== 

-- ==============================================================================
-- MULTI-TENANT RESTAURANT QR MENU SAAS - SUPABASE SCHEMA & RLS
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Users Table
-- Syncs with Supabase auth.users to store application-specific roles and metadata.
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'owner')) DEFAULT 'owner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Restaurants Table
-- Stores tenant restaurant profiles, opening hours, descriptions, and subscription states.
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo TEXT,
    address TEXT,
    phone TEXT,
    opening_hours TEXT DEFAULT 'Mon - Sun: 10:00 AM - 10:00 PM',
    description TEXT DEFAULT 'Welcome to our restaurant! Browse our digital QR menu below.',
    subscription_status TEXT NOT NULL CHECK (
        subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'inactive')
    ) DEFAULT 'trialing',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Categories Table
-- Stores menu categories for each individual restaurant.
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Menu Items Table
-- Stores individual food/beverage dishes with category, price, image, dietary flags, and availability.
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    image TEXT,
    is_veg BOOLEAN NOT NULL DEFAULT false,
    dietary_type TEXT NOT NULL CHECK (dietary_type IN ('veg', 'non-veg', 'vegan')) DEFAULT 'non-veg',
    available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Orders Table
-- Stores incoming customer orders tagged with restaurant, table, and kitchen status.
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    table_number TEXT NOT NULL,
    customer_notes TEXT,
    status TEXT NOT NULL CHECK (
        status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')
    ) DEFAULT 'pending',
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Create Order Items Table
-- Line items for each placed order.
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Create Feedback Table
-- Stores customer ratings (1-5 stars) and review comments after dining.
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    customer_name TEXT DEFAULT 'Diner',
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Create Subscriptions Table
-- Stores tenant SaaS subscription contracts, plans, and expiration timestamps.
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    plan TEXT NOT NULL CHECK (plan IN ('Starter', 'Pro', 'Enterprise', 'Growth')) DEFAULT 'Pro',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (
        status IN ('trialing', 'active', 'past_due', 'canceled', 'inactive')
    ) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON public.restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_subscription ON public.restaurants(subscription_status);
CREATE INDEX IF NOT EXISTS idx_categories_restaurant ON public.categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON public.menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(available);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_feedback_restaurant ON public.feedback(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON public.feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON public.feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_restaurant ON public.subscriptions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- 11. Automatic updated_at Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_restaurants_updated_at ON public.restaurants;
CREATE TRIGGER set_restaurants_updated_at
    BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at
    BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER set_menu_items_updated_at
    BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
    BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER set_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 12. User Signup Sync Trigger (Auth -> Public Users Table)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    user_name TEXT;
BEGIN
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'owner');
    user_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));

    IF user_role NOT IN ('admin', 'owner') THEN
        user_role := 'owner';
    END IF;

    INSERT INTO public.users (id, name, email, role)
    VALUES (NEW.id, user_name, NEW.email, user_role)
    ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        email = EXCLUDED.email;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.owns_restaurant(target_restaurant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.restaurants
        WHERE id = target_restaurant_id AND owner_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users Policies
CREATE POLICY "Users can read own profile"
    ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles"
    ON public.users FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can update any profile"
    ON public.users FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete users"
    ON public.users FOR DELETE USING (public.is_admin());

-- Restaurants Policies
CREATE POLICY "Public can view restaurant by slug"
    ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Owners can insert their restaurant"
    ON public.restaurants FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their own restaurant"
    ON public.restaurants FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Admins can manage any restaurant"
    ON public.restaurants FOR ALL USING (public.is_admin());

-- Categories Policies
CREATE POLICY "Public can view restaurant categories"
    ON public.categories FOR SELECT USING (true);
CREATE POLICY "Owners can insert categories in their own restaurant"
    ON public.categories FOR INSERT
    WITH CHECK (public.owns_restaurant(restaurant_id) OR public.is_admin());
CREATE POLICY "Owners can update categories in their own restaurant"
    ON public.categories FOR UPDATE
    USING (public.owns_restaurant(restaurant_id) OR public.is_admin())
    WITH CHECK (public.owns_restaurant(restaurant_id) OR public.is_admin());
CREATE POLICY "Owners can delete categories in their own restaurant"
    ON public.categories FOR DELETE
    USING (public.owns_restaurant(restaurant_id) OR public.is_admin());

-- Menu Items Policies
CREATE POLICY "Public can view restaurant menu items"
    ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Owners can insert menu items in their own restaurant"
    ON public.menu_items FOR INSERT
    WITH CHECK (public.owns_restaurant(restaurant_id) OR public.is_admin());
CREATE POLICY "Owners can update menu items in their own restaurant"
    ON public.menu_items FOR UPDATE
    USING (public.owns_restaurant(restaurant_id) OR public.is_admin())
    WITH CHECK (public.owns_restaurant(restaurant_id) OR public.is_admin());
CREATE POLICY "Owners can delete menu items in their own restaurant"
    ON public.menu_items FOR DELETE
    USING (public.owns_restaurant(restaurant_id) OR public.is_admin());

-- Orders Policies
CREATE POLICY "Public can insert orders"
    ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "View orders"
    ON public.orders FOR SELECT
    USING (public.owns_restaurant(restaurant_id) OR public.is_admin() OR true);
CREATE POLICY "Owners can update order status"
    ON public.orders FOR UPDATE
    USING (public.owns_restaurant(restaurant_id) OR public.is_admin())
    WITH CHECK (public.owns_restaurant(restaurant_id) OR public.is_admin());

-- Order Items Policies
CREATE POLICY "Public can insert order items"
    ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "View order items"
    ON public.order_items FOR SELECT USING (true);

-- Feedback Policies
CREATE POLICY "Public can submit feedback"
    ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can view restaurant feedback"
    ON public.feedback FOR SELECT
    USING (public.owns_restaurant(restaurant_id) OR public.is_admin());
CREATE POLICY "Admins can manage all feedback"
    ON public.feedback FOR ALL USING (public.is_admin());

-- Subscriptions Policies
CREATE POLICY "Admins can manage subscriptions"
    ON public.subscriptions FOR ALL
    USING (public.is_admin());
CREATE POLICY "Owners can view own subscription"
    ON public.subscriptions FOR SELECT
    USING (public.owns_restaurant(restaurant_id));


﻿-- ==============================================================================
-- MARKETING PUSH NOTIFICATION SYSTEM SCHEMA & RLS POLICIES
-- ==============================================================================

-- 1. Create Notification Subscriptions Table
CREATE TABLE IF NOT EXISTS public.notification_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    browser TEXT,
    device TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT uq_restaurant_endpoint UNIQUE (restaurant_id, endpoint)
);

-- Index for fast restaurant subscriber lookups
CREATE INDEX IF NOT EXISTS idx_notification_subs_restaurant_active 
ON public.notification_subscriptions(restaurant_id, active);

-- 2. Create Marketing Campaigns Table
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    image_url TEXT,
    cta_url TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    total_targeted INTEGER NOT NULL DEFAULT 0,
    total_sent INTEGER NOT NULL DEFAULT 0,
    total_failed INTEGER NOT NULL DEFAULT 0
);

-- Index for listing restaurant campaigns chronologically
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_restaurant 
ON public.marketing_campaigns(restaurant_id, sent_at DESC);

-- 3. Add marketing_enabled flag to restaurants if not exists
DO  
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'restaurants' AND column_name = 'marketing_enabled'
    ) THEN
        ALTER TABLE public.restaurants ADD COLUMN marketing_enabled BOOLEAN NOT NULL DEFAULT true;
    END IF;
END ;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Notification Subscriptions
-- Customers/diners (anonymous or auth) can insert their own push subscription for a restaurant
CREATE POLICY  Allow public customer push subscription registration
ON public.notification_subscriptions
FOR INSERT
WITH CHECK (true);

-- Restaurant owners can view and manage subscriptions for their own restaurant
CREATE POLICY Owners can view their restaurant subscriptions
ON public.notification_subscriptions
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = notification_subscriptions.restaurant_id
        AND r.owner_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND u.role = 'admin'
    )
);

CREATE POLICY Owners can update their restaurant subscriptions
ON public.notification_subscriptions
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = notification_subscriptions.restaurant_id
        AND r.owner_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND u.role = 'admin'
    )
);

CREATE POLICY Owners can delete their restaurant subscriptions
ON public.notification_subscriptions
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = notification_subscriptions.restaurant_id
        AND r.owner_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND u.role = 'admin'
    )
);

-- 6. RLS Policies for Marketing Campaigns
CREATE POLICY Owners can view their restaurant marketing campaigns
ON public.marketing_campaigns
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = marketing_campaigns.restaurant_id
        AND r.owner_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND u.role = 'admin'
    )
);

CREATE POLICY Owners can insert campaigns for their restaurant
ON public.marketing_campaigns
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = marketing_campaigns.restaurant_id
        AND r.owner_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid() AND u.role = 'admin'
    )
);


-- ==============================================================================
-- DYNAMIC SUBSCRIPTION PLANS & ADMIN BROADCAST COMMUNICATIONS
-- ==============================================================================

-- 1. Create Subscription Plans Table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price_monthly NUMERIC(10, 2) NOT NULL,
    price_yearly NUMERIC(10, 2) NOT NULL,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    max_restaurants INTEGER NOT NULL DEFAULT 1,
    max_qr_codes INTEGER NOT NULL DEFAULT 10,
    max_orders INTEGER NOT NULL DEFAULT 500,
    max_staff INTEGER NOT NULL DEFAULT 3,
    marketing_enabled BOOLEAN NOT NULL DEFAULT true,
    ai_enabled BOOLEAN NOT NULL DEFAULT false,
    analytics_enabled BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for ordering plans on pricing page
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active_sort 
ON public.subscription_plans(is_active, sort_order ASC);

-- 2. Seed Default Plans in Indian Rupees (₹)
INSERT INTO public.subscription_plans (
    id, name, slug, description, price_monthly, price_yearly, 
    features, max_restaurants, max_qr_codes, max_orders, max_staff, 
    marketing_enabled, ai_enabled, analytics_enabled, is_featured, is_active, sort_order
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'Starter Bistro',
    'starter',
    'For boutique cafes, wine bars & quick-service food joints.',
    199.00,
    1999.00,
    '["Up to 12 QR table terminals", "Standard Single-Zone Floor Radar", "Instant KDS Kitchen Display", "Offline Cache Protection", "Public customer guest ordering"]'::jsonb,
    1, 12, 1000, 3,
    false, false, true, false, true, 1
),
(
    '00000000-0000-0000-0000-000000000002',
    'Pro Hospitality',
    'pro',
    'For high-cadence dining rooms requiring expanded pass sync and multiple zones.',
    499.00,
    4999.00,
    '["Unlimited floor terminals & reservations", "Architectural Multi-Zone Floor Radar", "Smart KDS Routing (Pass, Grill, Prep)", "Web Push Marketing Hub (RFC 8291)", "Sommelier & Course Pacing", "24/7 Dedicated Floor Support"]'::jsonb,
    3, 50, 5000, 10,
    true, true, true, true, true, 2
),
(
    '00000000-0000-0000-0000-000000000003',
    'Heritage Group',
    'enterprise',
    'For multi-property collections, boutique hotel dining groups, and legacy estates.',
    999.00,
    9999.00,
    '["Unlimited restaurants & table QR tents", "Enterprise Multi-Property Console", "Centralized Multi-Unit Accounting", "Dedicated Account Concierge", "Custom Domain & White-labeling", "Priority Feature Access & SLAs"]'::jsonb,
    10, 200, 50000, 50,
    true, true, true, false, true, 3
)
ON CONFLICT (slug) DO UPDATE SET 
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly;

-- 3. Create Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal', -- normal, important, critical
    target_audience TEXT NOT NULL DEFAULT 'all', -- all, trial, premium, expired, specific
    target_restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    image_url TEXT,
    cta_label TEXT,
    cta_url TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_announcements_created 
ON public.announcements(created_at DESC);

-- 4. Create Restaurant Notifications Table
CREATE TABLE IF NOT EXISTS public.restaurant_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
    read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_restaurant_announcement UNIQUE (restaurant_id, announcement_id)
);

CREATE INDEX IF NOT EXISTS idx_resto_notifications_unread 
ON public.restaurant_notifications(restaurant_id, read);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_notifications ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Public can read active subscription plans
CREATE POLICY "Allow public read active subscription plans"
ON public.subscription_plans FOR SELECT
USING (is_active = true);

-- Super admin full access to subscription plans
CREATE POLICY "Allow super admin full control of plans"
ON public.subscription_plans FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Super admin full access to announcements
CREATE POLICY "Allow super admin full control of announcements"
ON public.announcements FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Restaurant owners can read their own notifications
CREATE POLICY "Allow restaurant owners to view their notifications"
ON public.restaurant_notifications FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.restaurants 
        WHERE restaurants.id = restaurant_notifications.restaurant_id 
        AND restaurants.owner_id = auth.uid()
    )
);

-- Restaurant owners can update read status on their own notifications
CREATE POLICY "Allow restaurant owners to mark notifications read"
ON public.restaurant_notifications FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.restaurants 
        WHERE restaurants.id = restaurant_notifications.restaurant_id 
        AND restaurants.owner_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.restaurants 
        WHERE restaurants.id = restaurant_notifications.restaurant_id 
        AND restaurants.owner_id = auth.uid()
    )
);


--
-- ============================================================================== 
-- ENABLE REALTIME REPLICATION FOR LIVE KDS ORDERS & NOTIFICATIONS
-- ============================================================================== 
DO 
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders, public.order_items, public.notification_subscriptions;
    EXCEPTION WHEN duplicate_object THEN
        -- already in publication
        NULL;
    END;
END ;

-- ==============================================================================
-- DEMO RESTAURANTS, CATEGORIES & MENU ITEMS SEED DATA (₹ INR)
-- ==============================================================================

-- Seed Demo Auth Users
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at
) VALUES 
(
    '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000',
    'admin@demo.com', crypt('password123', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Platform Super Admin","role":"admin"}'::jsonb,
    'authenticated', 'authenticated', now(), now()
),
(
    '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000',
    'owner@demo.com', crypt('password123', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Marco Rossi","role":"owner"}'::jsonb,
    'authenticated', 'authenticated', now(), now()
)
ON CONFLICT (id) DO NOTHING;

-- Seed Public Users
INSERT INTO public.users (id, name, email, role)
VALUES 
('00000000-0000-0000-0000-000000000001', 'Platform Super Admin', 'admin@demo.com', 'admin'),
('00000000-0000-0000-0000-000000000002', 'Marco Rossi', 'owner@demo.com', 'owner')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, email = EXCLUDED.email, role = EXCLUDED.role;

-- Seed Demo Restaurants
INSERT INTO public.restaurants (
    id, owner_id, name, slug, logo, address, phone, opening_hours, description, subscription_status, marketing_enabled
) VALUES 
(
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000002',
    'La Piazza Trattoria',
    'la-piazza',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    '142 Via Della Spiga, Little Italy, NY 10013',
    '+1 (212) 555-0199',
    'Mon - Sun: 11:30 AM - 11:00 PM',
    'Authentic rustic Italian trattoria specializing in handcrafted sourdough pizzas, fresh tagliatelle, and imported Italian wines.',
    'active',
    true
),
(
    '00000000-0000-0000-0000-000000000020',
    '00000000-0000-0000-0000-000000000002',
    'Tokyo Ramen House',
    'tokyo-ramen',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&auto=format&fit=crop&q=80',
    '742 Shibuya Crossing Blvd, San Francisco, CA 94103',
    '+1 (415) 555-0842',
    'Tue - Sun: 12:00 PM - 10:00 PM (Closed Mondays)',
    'Slow-simmered 18-hour tonkotsu broth, handmade ramen noodles, and crispy gyoza.',
    'active',
    true
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, slug = EXCLUDED.slug, description = EXCLUDED.description, address = EXCLUDED.address, phone = EXCLUDED.phone;

-- Seed Categories for La Piazza
INSERT INTO public.categories (id, restaurant_id, name)
VALUES 
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000010', 'Starters & Antipasti'),
('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000010', 'Artisan Pizzas'),
('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000010', 'Handmade Pastas'),
('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000010', 'Desserts & Dolci'),
('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000010', 'Beverages')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Seed Menu Items for La Piazza
INSERT INTO public.menu_items (
    id, restaurant_id, category_id, name, description, price, image, is_veg, dietary_type, available
) VALUES 
('00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000101', 'Bruschetta al Pomodoro', 'Toasted sourdough bread, heirloom tomatoes, fresh sweet basil, garlic, and aged balsamic glaze.', 180.00, 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=500&auto=format&fit=crop&q=80', true, 'vegan', true),
('00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000101', 'Burrata Pugliese', 'Creamy fresh burrata cheese, heirloom tomatoes, wild baby arugula, and extra virgin olive oil.', 320.00, 'https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?w=500&auto=format&fit=crop&q=80', true, 'veg', true),
('00000000-0000-0000-0000-000000001003', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000102', 'Margherita D.O.P.', 'San Marzano tomato sauce, fior di latte mozzarella, fresh basil leaves, and cold-pressed olive oil.', 290.00, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&auto=format&fit=crop&q=80', true, 'veg', true),
('00000000-0000-0000-0000-000000001004', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000102', 'Truffle & Wild Mushroom Pizza', 'Black truffle cream, roasted shiitake and cremini mushrooms, fontina cheese, and fresh thyme.', 420.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80', true, 'veg', true),
('00000000-0000-0000-0000-000000001005', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000103', 'Tagliatelle al Tartufo', 'Hand-rolled egg tagliatelle, black summer truffles, creamy butter sauce, and 24-month Parmigiano-Reggiano.', 450.00, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500&auto=format&fit=crop&q=80', true, 'veg', true),
('00000000-0000-0000-0000-000000001006', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000103', 'Classic Lasagna Bolognese', 'Layered fresh pasta sheets, slow-braised beef ragu, creamy bechamel, and melted mozzarella.', 390.00, 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500&auto=format&fit=crop&q=80', false, 'non-veg', true),
('00000000-0000-0000-0000-000000001007', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000104', 'Tiramisu Tradizionale', 'Espresso-soaked Savoiardi ladyfingers, mascarpone sabayon, and Dutch dark cocoa dusting.', 190.00, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500&auto=format&fit=crop&q=80', true, 'veg', true),
('00000000-0000-0000-0000-000000001008', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000105', 'San Pellegrino Sparkling (750ml)', 'Imported natural sparkling mineral water from the Italian Alps.', 120.00, 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=500&auto=format&fit=crop&q=80', true, 'vegan', true)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price, is_veg = EXCLUDED.is_veg, dietary_type = EXCLUDED.dietary_type;

-- Seed Subscriptions
INSERT INTO public.subscriptions (
    id, restaurant_id, plan, start_date, expiry_date, status
) VALUES 
('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000010', 'Pro', now() - interval '14 days', now() + interval '350 days', 'active'),
('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000020', 'Enterprise', now() - interval '10 days', now() + interval '220 days', 'active')
ON CONFLICT (id) DO NOTHING;

